import { cn } from '@/utilities/ui'
import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  'aria-errormessage'?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  type, 
  className, 
  error,
  ...props 
}, ref) => {
  // Set aria-invalid attribute based on error prop or aria-invalid prop
  const hasError = error || props['aria-invalid']
  
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        hasError && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      ref={ref}
      type={type}
      aria-invalid={hasError ? true : undefined}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
