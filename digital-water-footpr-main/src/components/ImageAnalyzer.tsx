import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X, Drop } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { estimateWaterContent } from '@/lib/estimator'
import { EstimationResult } from '@/lib/types'
import { toast } from 'sonner'

interface ImageAnalyzerProps {
  onAnalysisComplete: (result: EstimationResult) => void
}

export function ImageAnalyzer({ onAnalysisComplete }: ImageAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<EstimationResult | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setSelectedImage(imageData)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      })
      
      streamRef.current = stream
      setIsCameraOpen(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Unable to access camera. Please grant camera permissions.')
      console.error('Camera error:', error)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setSelectedImage(imageData)
      setResult(null)
      closeCamera()
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setResult(null)

    try {
      const analysisResult = await estimateWaterContent(selectedImage)
      setResult(analysisResult)
      onAnalysisComplete(analysisResult)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setResult(null)
    setIsAnalyzing(false)
    closeCamera()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-secondary'
    if (confidence >= 0.6) return 'bg-accent'
    return 'bg-destructive'
  }

  return (
    <div className="flex flex-col gap-6">
      {isCameraOpen ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Camera View</CardTitle>
              <Button size="sm" variant="ghost" onClick={closeCamera}>
                <X size={20} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border bg-muted">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <Button size="lg" onClick={capturePhoto} className="w-full">
              <Camera size={24} className="mr-2" />
              Capture Photo
            </Button>
          </CardContent>
        </Card>
      ) : !selectedImage ? (
        <Card>
          <CardHeader>
            <CardTitle>Analyze a Product</CardTitle>
            <CardDescription>Capture or upload an image to estimate its water footprint</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={openCamera}
                className="h-32 flex flex-col gap-2"
              >
                <Camera size={32} />
                <span>Take Photo</span>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="h-32 flex flex-col gap-2"
              >
                <Upload size={32} />
                <span>Upload Image</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Image Preview</CardTitle>
                <Button size="sm" variant="ghost" onClick={handleReset}>
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <img
                src={selectedImage}
                alt="Selected product"
                className="w-full h-64 object-cover rounded-lg border-2 border-border"
              />

              {!result && (
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Water Footprint'}
                </Button>
              )}
            </CardContent>
          </Card>

          {isAnalyzing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Drop size={32} weight="fill" className="text-primary" />
                  </div>
                  <p className="text-muted-foreground">Processing image with ML model...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{result.productName}</CardTitle>
                    <CardDescription>Water Footprint Analysis</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {Math.round(result.confidence * 100)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-semibold text-primary">
                      {result.waterLiters.toLocaleString()}
                    </span>
                    <span className="text-xl text-muted-foreground">liters</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Virtual water content per unit
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Level</span>
                    <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <Progress 
                    value={result.confidence * 100} 
                    className={`h-2 ${getConfidenceColor(result.confidence)}`}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Analyze Another Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
