import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import Link from 'next/link'

export default function AccountLockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-background/80 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle>Account Locked</CardTitle>
          <CardDescription>
            Your account has been temporarily locked due to multiple failed login attempts
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
            <p className="font-medium">Your account will be automatically unlocked in 30 minutes.</p>
            <p>For security purposes, please try logging in again after this period.</p>
          </div>

          <p className="text-sm text-muted-foreground">
            If you continue to have issues, please contact your administrator for assistance.
          </p>

          <Link href="/auth/sign-in">
            <Button className="w-full">Return to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
