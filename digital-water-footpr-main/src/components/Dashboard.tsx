import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ImageAnalyzer } from './ImageAnalyzer'
import { HistoryList } from './HistoryList'
import { SummaryDashboard } from './SummaryDashboard'
import { AdminPanel } from './AdminPanel'
import { EstimationEvent, EstimationResult, Summary } from '@/lib/types'
import { generateId } from '@/lib/auth'
import { SignOut, Drop, Shield } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function Dashboard() {
  const { user, logout, isAdmin } = useAuth()
  const [events, setEvents] = useKV<EstimationEvent[]>('estimationEvents', [])
  const [activeTab, setActiveTab] = useState('analyze')

  const handleAnalysisComplete = (result: EstimationResult) => {
    if (!user) return

    const newEvent: EstimationEvent = {
      id: generateId(),
      userId: user.id,
      productName: result.productName,
      waterLiters: result.waterLiters,
      confidence: result.confidence,
      createdAt: result.createdAt,
      imageData: result.imageData
    }

    setEvents((prev) => [...(prev || []), newEvent])
    
    setTimeout(() => {
      setActiveTab('history')
    }, 2000)
  }

  const userEvents = useMemo(() => {
    return (events || []).filter(e => e.userId === user?.id)
  }, [events, user?.id])

  const summary: Summary = useMemo(() => {
    const totalAnalyses = userEvents.length
    const totalWaterLiters = userEvents.reduce((sum, e) => sum + e.waterLiters, 0)

    const productMap = new Map<string, { waterLiters: number; count: number }>()
    userEvents.forEach(event => {
      const existing = productMap.get(event.productName)
      if (existing) {
        existing.waterLiters += event.waterLiters
        existing.count += 1
      } else {
        productMap.set(event.productName, { waterLiters: event.waterLiters, count: 1 })
      }
    })

    const topProducts = Array.from(productMap.entries())
      .map(([productName, data]) => ({
        productName,
        waterLiters: data.waterLiters,
        count: data.count
      }))
      .sort((a, b) => b.waterLiters - a.waterLiters)
      .slice(0, 5)

    return { totalAnalyses, totalWaterLiters, topProducts }
  }, [userEvents])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Drop size={24} weight="fill" className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Water Footprint Calculator</h1>
                <p className="text-xs text-muted-foreground">Track your virtual water usage</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Shield size={16} weight="fill" />
                  <span>Admin</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <SignOut size={20} />
                <span className="ml-2 hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 mb-8">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <ImageAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <SummaryDashboard summary={summary} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryList events={userEvents} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
