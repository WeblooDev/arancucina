'use client'

import { cn } from '@/utilities/ui'
import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      error: {
        true: 'text-destructive',
        false: 'text-foreground',
      },
      required: {
        true: '',
      },
    },
    defaultVariants: {
      error: false,
      required: false,
    },
  }
)

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root>,
  VariantProps<typeof labelVariants> {
  error?: boolean
  required?: boolean
  htmlFor?: string
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ 
  className, 
  error,
  required,
  children,
  ...props 
}, ref) => (
  <LabelPrimitive.Root 
    className={cn(labelVariants({ error, required }), className)} 
    ref={ref} 
    {...props}
  >
    {children}
    {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
  </LabelPrimitive.Root>
))

Label.displayName = "Label"

export { Label }
