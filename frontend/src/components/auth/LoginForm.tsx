import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/app/components/common/Spinner'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

function GoogleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, loginWithGoogle } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const googleButtonRef = useRef<HTMLDivElement>(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    if (!googleClientId) return

    const initializeGsi = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) {
              setErrorMessage('Google authentication did not return a valid credential.')
              return
            }

            setIsGoogleLoading(true)
            setErrorMessage(null)
            try {
              await loginWithGoogle(response.credential)
            } catch (err: unknown) {
              if (err instanceof Error) {
                setErrorMessage(err.message)
              } else {
                setErrorMessage('Google sign-in failed. Please try again.')
              }
            } finally {
              setIsGoogleLoading(false)
            }
          },
        })

        // Render official GIS button into ref container
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        })
      } catch (err) {
        console.error('Failed to initialize Google Sign-In:', err)
      }
    }

    if (window.google?.accounts?.id) {
      initializeGsi()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initializeGsi()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [googleClientId, loginWithGoogle])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedUsername = username.trim()
    if (!trimmedUsername || !password) {
      setErrorMessage('Please enter both your username and password.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        username: trimmedUsername,
        password,
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFallbackGoogleClick = () => {
    if (!googleClientId) {
      setErrorMessage(
        'Google Client ID is not configured. Please define VITE_GOOGLE_CLIENT_ID in your frontend .env.local file.'
      )
      return
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1 text-left">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your secure session
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Google Sign In Area */}
      <div className="w-full flex flex-col items-center justify-center pt-1">
        {/* Render container for Google Identity Services */}
        <div
          ref={googleButtonRef}
          className={`w-full flex justify-center [&>div]:w-full ${!googleClientId ? 'hidden' : ''}`}
        />

        {/* Fallback button when Google Client ID is not yet configured or while GIS initializes */}
        {(!googleClientId || isGoogleLoading) && (
          <Button
            type="button"
            variant="outline"
            className="w-full font-medium shadow-sm hover:bg-accent/60 transition-colors flex items-center justify-center gap-2 cursor-pointer h-10 border-border/80"
            onClick={handleFallbackGoogleClick}
            disabled={isSubmitting || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Spinner size="sm" />
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="size-4" />
                <span>Continue with Google</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">
            Or continue with credentials
          </span>
        </div>
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="login-username">Username</Label>
        <div className="relative flex items-center">
          <User className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="login-username"
            type="text"
            placeholder="e.g. john_doe"
            className="pl-9"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting || isGoogleLoading}
            autoComplete="username"
            autoFocus
            required
          />
        </div>
      </div>

      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
        </div>
        <div className="relative flex items-center">
          <Lock className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="pl-9 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting || isGoogleLoading}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            disabled={isSubmitting || isGoogleLoading}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full font-semibold shadow-md cursor-pointer"
        disabled={isSubmitting || isGoogleLoading}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account?{' '}
        <Button
          type="button"
          variant="link"
          className="text-xs font-semibold text-primary hover:underline p-0 h-auto cursor-pointer"
          onClick={onSwitchToRegister}
          disabled={isSubmitting || isGoogleLoading}
        >
          Create an account
        </Button>
      </div>
    </form>
  )
}
