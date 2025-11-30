export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  isActive: boolean
}

export interface AuthToken {
  token: string
  expiresAt: number
  user: User
}

export interface EstimationEvent {
  id: string
  userId: string
  productName: string
  waterLiters: number
  confidence: number
  createdAt: string
  imageData: string
}

export interface WaterCoefficient {
  id: string
  productName: string
  category: string
  unit: string
  baseLiters: number
}

export interface EstimationResult {
  productName: string
  waterLiters: number
  confidence: number
  imageData: string
  createdAt: string
}

export interface Summary {
  totalAnalyses: number
  totalWaterLiters: number
  topProducts: Array<{
    productName: string
    waterLiters: number
    count: number
  }>
}
