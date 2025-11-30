import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { AuthPage } from '@/components/AuthPage'
import { Dashboard } from '@/components/Dashboard'

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
      <Toaster position="top-right" />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App