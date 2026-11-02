import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { Layers, ShieldCheck, LockKeyhole } from 'lucide-react'

export function AuthCard() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <div className="w-full max-w-[440px] mx-auto transition-all duration-300">
      <Card className="border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                <Layers className="size-5" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Modular Auth
                </h1>
                <p className="text-xs text-muted-foreground">
                  Hexagonal Architecture
                </p>
              </div>
            </div>
            <Badge variant="indigo" className="flex items-center gap-1">
              <ShieldCheck className="size-3" />
              <span>JWT + HttpOnly</span>
            </Badge>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'login' | 'register')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <CardContent className="px-0 pt-4 pb-2">
              <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
              </TabsContent>

              <TabsContent value="register" className="mt-0 focus-visible:outline-none">
                <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>

        <CardFooter className="flex items-center justify-center gap-2 border-t border-border/60 py-3 text-xs text-muted-foreground">
          <LockKeyhole className="size-3.5 text-primary" />
          <span>XSS Resistant &bull; In-Memory Access &bull; Secure Cookies</span>
        </CardFooter>
      </Card>
    </div>
  )
}
