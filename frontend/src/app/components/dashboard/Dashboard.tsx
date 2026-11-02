import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/api/authApi'
import { decodeJwt } from '@/utils/jwt'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/app/components/common/Spinner'
import {
  Layers,
  LogOut,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Activity,
  Cookie,
  Database,
  Lock,
  Plus,
  Minus,
} from 'lucide-react'

import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store'
import { increment, decrement } from '@/app/features/counter/counterSlice'

export function Dashboard() {
  const { user, accessToken, logout } = useAuth()

  const [testResult, setTestResult] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [copiedToken, setCopiedToken] = useState(false)
  const [showTokenDetails, setShowTokenDetails] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const decoded = accessToken ? decodeJwt(accessToken) : null

  // Redux store hooks
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch<AppDispatch>()

  const handleCopyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleTestProtectedApi = async () => {
    setTestStatus('loading')
    setTestResult(null)

    try {
      const data = await authApi.testProtectedEndpoint()
      setTestResult(JSON.stringify(data, null, 2))
      setTestStatus('success')
    } catch (err: unknown) {
      setTestStatus('error')
      if (err instanceof Error) {
        setTestResult(err.message)
      } else {
        setTestResult('Failed to reach backend protected endpoint.')
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Sample Redux Usage */}
      <p className='font-bold text-lg'>Implemented by Redux-Toolkit Store</p>
      <div className='flex justify-between items-center bg-red-300 p-3 rounded-xl'>
        <div>
          <Button onClick={() => dispatch(increment())}><Plus className="size-4" />&nbsp;Increment</Button>
        </div>
        <p className='py-2 text-lg font-bold'>Count is: {count}</p>
        <div>
          <Button onClick={() => dispatch(decrement())}><Minus className="size-4" />&nbsp;Decrement</Button>
        </div>
      </div>

      {/* Top Navbar Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Layers className="size-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Modular Monolith</span>
              <Badge variant="success" className="text-[10px] px-2 py-0">
                XSS Protected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Hexagonal Architecture &bull; Spring Boot + React
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/30">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user?.username}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer gap-1.5 text-xs font-semibold"
          >
            {isLoggingOut ? (
              <Spinner size="sm" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            <span>Log out</span>
          </Button>
        </div>
      </header>

      {/* Hero Welcome Card */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/10 via-card to-card">
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              Welcome back,{' '}
              <span className="text-primary">{user?.username}</span> 👋
            </CardTitle>
            <CardDescription className="text-sm">
              Your session is protected against Cross-Site Scripting (XSS). Access
              tokens exist only in memory, and refresh tokens are managed by
              browser HttpOnly cookies.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="rounded-lg border border-border/70 bg-background/50 p-3 space-y-1">
              <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                Access Token
              </span>
              <p className="text-sm font-semibold text-emerald-400">
                In-Memory (Volatile)
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 p-3 space-y-1">
              <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                Refresh Token
              </span>
              <p className="text-sm font-semibold text-indigo-400">
                HttpOnly Secure Cookie
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 p-3 space-y-1">
              <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                LocalStorage State
              </span>
              <p className="text-sm font-semibold text-muted-foreground">
                0 Tokens (Safe)
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/50 p-3 space-y-1">
              <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                Session Expiry
              </span>
              <p className="text-sm font-semibold text-foreground">
                {user?.tokenExpiry
                  ? user.tokenExpiry.toLocaleTimeString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Architecture Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="size-5" />
              <CardTitle className="text-sm font-semibold">
                In-Memory Access Token
              </CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">
              Short-lived JWT kept only in JavaScript runtime memory. Cannot be
              inspected or extracted by XSS scripts reading{' '}
              <code className="text-primary font-mono text-[11px]">
                window.localStorage
              </code>
              .
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Cookie className="size-5" />
              <CardTitle className="text-sm font-semibold">
                HttpOnly Refresh Cookie
              </CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">
              Restricted to{' '}
              <code className="text-primary font-mono text-[11px]">
                Path=/api/v1/auth
              </code>
              . Hidden from JavaScript, immune to theft even in the presence of an
              XSS vulnerability.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Database className="size-5" />
              <CardTitle className="text-sm font-semibold">
                Transparent Session Refresh
              </CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">
              On page reload or 401 token expiration, the frontend silently
              requests a new in-memory access token without interrupting your work.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Access Token Inspector Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Current In-Memory Access Token
            </CardTitle>
            <CardDescription className="text-xs">
              Transmitted in the HTTP{' '}
              <code className="font-mono text-primary text-[11px]">
                Authorization: Bearer
              </code>{' '}
              header
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToken}
              className="cursor-pointer gap-1.5 text-xs"
            >
              {copiedToken ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy JWT</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTokenDetails((prev) => !prev)}
              className="cursor-pointer text-xs"
            >
              {showTokenDetails ? 'Hide Claims' : 'Inspect Claims'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-md bg-background/80 border border-border/80 font-mono text-xs text-sky-400 break-all select-all">
            {accessToken
              ? `${accessToken.substring(0, 60)}...${accessToken.substring(
                accessToken.length - 20
              )}`
              : 'No active access token'}
          </div>

          {showTokenDetails && decoded && (
            <div className="p-4 rounded-md bg-background/90 border border-border space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Decoded JWT Claims (RFC 7519)
              </h4>
              <pre className="text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(decoded, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backend API Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            Verify Protected Backend Endpoint
          </CardTitle>
          <CardDescription className="text-xs">
            Send an authenticated request to the Spring Boot backend with your
            in-memory Bearer token to test end-to-end authorization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleTestProtectedApi}
            disabled={testStatus === 'loading'}
            className="cursor-pointer font-semibold shadow-md gap-2"
          >
            {testStatus === 'loading' ? (
              <>
                <Spinner size="sm" />
                <span>Testing Protected API...</span>
              </>
            ) : (
              <>
                <Activity className="size-4" />
                <span>Test Protected Endpoint (/actuator/health)</span>
              </>
            )}
          </Button>

          {testStatus === 'success' && (
            <Alert variant="success" className="space-y-2">
              <AlertDescription className="text-xs font-medium">
                Protected request succeeded! Token verified by backend RSA public
                key.
              </AlertDescription>
              <pre className="text-xs font-mono text-emerald-300 bg-background/60 p-2.5 rounded border border-emerald-500/20 overflow-x-auto">
                {testResult}
              </pre>
            </Alert>
          )}

          {testStatus === 'error' && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs font-medium">
                Backend response error: {testResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
