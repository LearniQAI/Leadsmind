'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to a monitoring service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred. We have been notified and are working on a fix.
      </p>
      
      <div className="flex gap-4">
        <Button 
          variant="default" 
          onClick={() => reset()}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Return home
        </Button>
      </div>
    </div>
  )
}
