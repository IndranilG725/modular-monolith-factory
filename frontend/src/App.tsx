import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { AuthCard } from './components/auth/AuthCard'
import { Dashboard } from './app/components/dashboard/Dashboard'
import { Spinner } from './app/components/common/Spinner'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Spinner size="lg" />
        <p className="text-sm font-medium">Restoring secure session...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-foreground">
      {isAuthenticated ? <Dashboard /> : <AuthCard />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
