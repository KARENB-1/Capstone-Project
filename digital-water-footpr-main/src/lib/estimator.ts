import { EstimationResult } from './types'

const PRODUCT_DATABASE = [
  { name: 'Tomato', category: 'Vegetable', baseLiters: 214 },
  { name: 'Apple', category: 'Fruit', baseLiters: 822 },
  { name: 'Banana', category: 'Fruit', baseLiters: 790 },
  { name: 'Potato', category: 'Vegetable', baseLiters: 287 },
  { name: 'Rice', category: 'Grain', baseLiters: 2497 },
  { name: 'Wheat Bread', category: 'Grain', baseLiters: 1608 },
  { name: 'Beef', category: 'Meat', baseLiters: 15415 },
  { name: 'Chicken', category: 'Meat', baseLiters: 4325 },
  { name: 'Milk', category: 'Dairy', baseLiters: 1020 },
  { name: 'Cheese', category: 'Dairy', baseLiters: 3178 },
  { name: 'Coffee', category: 'Beverage', baseLiters: 18900 },
  { name: 'Tea', category: 'Beverage', baseLiters: 8860 },
  { name: 'Cotton T-Shirt', category: 'Clothing', baseLiters: 2700 },
  { name: 'Jeans', category: 'Clothing', baseLiters: 10850 },
  { name: 'Orange', category: 'Fruit', baseLiters: 560 },
  { name: 'Lettuce', category: 'Vegetable', baseLiters: 237 },
]

function analyzeImageFeatures(imageData: string): Promise<{ color: string; complexity: number }> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = 100
      canvas.height = 100
      ctx?.drawImage(img, 0, 0, 100, 100)
      
      const imageDataObj = ctx?.getImageData(0, 0, 100, 100)
      if (!imageDataObj) {
        resolve({ color: 'unknown', complexity: 0.5 })
        return
      }
      
      let r = 0, g = 0, b = 0
      for (let i = 0; i < imageDataObj.data.length; i += 4) {
        r += imageDataObj.data[i]
        g += imageDataObj.data[i + 1]
        b += imageDataObj.data[i + 2]
      }
      
      const pixels = imageDataObj.data.length / 4
      r = Math.floor(r / pixels)
      g = Math.floor(g / pixels)
      b = Math.floor(b / pixels)
      
      let dominantColor = 'unknown'
      if (r > g && r > b) dominantColor = 'red'
      else if (g > r && g > b) dominantColor = 'green'
      else if (b > r && b > g) dominantColor = 'blue'
      else if (r > 150 && g > 150 && b > 150) dominantColor = 'white'
      else if (r < 100 && g < 100 && b < 100) dominantColor = 'dark'
      else dominantColor = 'neutral'
      
      const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)
      const complexity = Math.min(variance / 300, 1)
      
      resolve({ color: dominantColor, complexity })
    }
    
    img.onerror = () => {
      resolve({ color: 'unknown', complexity: 0.5 })
    }
    
    img.src = imageData
  }) as Promise<{ color: string; complexity: number }>
}

export async function estimateWaterContent(imageData: string): Promise<EstimationResult> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const features = await analyzeImageFeatures(imageData)
  
  let candidateProducts = [...PRODUCT_DATABASE]
  
  if (features.color === 'red') {
    candidateProducts = candidateProducts.filter(p => 
      ['Tomato', 'Apple', 'Beef', 'Cotton T-Shirt'].includes(p.name)
    )
  } else if (features.color === 'green') {
    candidateProducts = candidateProducts.filter(p => 
      ['Lettuce', 'Tea', 'Apple', 'Potato'].includes(p.name)
    )
  } else if (features.color === 'neutral' || features.color === 'white') {
    candidateProducts = candidateProducts.filter(p => 
      ['Rice', 'Wheat Bread', 'Milk', 'Potato', 'Cotton T-Shirt'].includes(p.name)
    )
  } else if (features.color === 'dark') {
    candidateProducts = candidateProducts.filter(p => 
      ['Coffee', 'Beef', 'Jeans'].includes(p.name)
    )
  }
  
  if (candidateProducts.length === 0) {
    candidateProducts = PRODUCT_DATABASE
  }
  
  const selectedProduct = candidateProducts[Math.floor(Math.random() * candidateProducts.length)]
  
  const variance = 0.8 + (Math.random() * 0.4)
  const waterLiters = Math.round(selectedProduct.baseLiters * variance * 10) / 10
  
  const baseConfidence = 0.75 + (features.complexity * 0.15)
  const confidence = Math.round((baseConfidence + (Math.random() * 0.1)) * 100) / 100
  
  return {
    productName: selectedProduct.name,
    waterLiters,
    confidence: Math.min(confidence, 0.95),
    imageData,
    createdAt: new Date().toISOString()
  }
}

export function getProductDatabase() {
  return PRODUCT_DATABASE
}
