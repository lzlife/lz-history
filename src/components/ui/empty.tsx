import * as React from 'react'
import { cn } from '../../lib/utils'

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
      {...props}
    />
  )
)
Empty.displayName = 'Empty'

interface EmptyHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmptyHeader = React.forwardRef<HTMLDivElement, EmptyHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col items-center gap-2', className)} {...props} />
  )
)
EmptyHeader.displayName = 'EmptyHeader'

interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'icon'
}

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === 'icon' && 'flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground',
        className
      )}
      {...props}
    />
  )
)
EmptyMedia.displayName = 'EmptyMedia'

interface EmptyTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const EmptyTitle = React.forwardRef<HTMLHeadingElement, EmptyTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-semibold', className)} {...props} />
  )
)
EmptyTitle.displayName = 'EmptyTitle'

interface EmptyDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const EmptyDescription = React.forwardRef<HTMLParagraphElement, EmptyDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground max-w-xs', className)} {...props} />
  )
)
EmptyDescription.displayName = 'EmptyDescription'

interface EmptyContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmptyContent = React.forwardRef<HTMLDivElement, EmptyContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4', className)} {...props} />
  )
)
EmptyContent.displayName = 'EmptyContent'

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent }
