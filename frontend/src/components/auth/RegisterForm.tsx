import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/app/components/common/Spinner'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const validateForm = (): string | null => {
    const trimmedUser = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUser) {
      return 'Username is required.'
    }
    if (trimmedUser.length < 3 || trimmedUser.length > 50) {
      return 'Username must be between 3 and 50 characters.'
    }
    if (!trimmedEmail) {
      return 'Email address is required.'
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return 'Please enter a valid email address.'
    }
    if (!password) {
      return 'Password is required.'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1 text-left">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Create an account
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign up with your credentials to get started
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

      <div className="space-y-1.5 text-left">
        <Label htmlFor="register-username">Username</Label>
        <div className="relative flex items-center">
          <User className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-username"
            type="text"
            placeholder="Choose username (3-50 chars)"
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

      <div className="space-y-1.5 text-left">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@company.com"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            className="pl-9 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
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

      <div className="space-y-1.5 text-left">
        <Label htmlFor="register-confirm-password">Confirm Password</Label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            className="pl-9 pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full font-semibold shadow-md cursor-pointer mt-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Sign Up</span>
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-1">
        Already have an account?{' '}
        <Button
          type="button"
          variant="link"
          className="text-xs font-semibold text-primary hover:underline p-0 h-auto cursor-pointer"
          onClick={onSwitchToLogin}
          disabled={isSubmitting}
        >
          Sign in here
        </Button>
      </div>
    </form>
  )
}
