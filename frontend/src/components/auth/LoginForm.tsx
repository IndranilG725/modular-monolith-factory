import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/app/components/common/Spinner'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
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
        disabled={isSubmitting}
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
          disabled={isSubmitting}
        >
          Create an account
        </Button>
      </div>
    </form>
  )
}
