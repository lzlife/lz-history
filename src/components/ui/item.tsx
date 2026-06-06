import * as React from 'react'
import { cn } from '../../lib/utils'

interface ItemGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const ItemGroup = React.forwardRef<HTMLDivElement, ItemGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('divide-y divide-border', className)} {...props} />
  )
)
ItemGroup.displayName = 'ItemGroup'

const itemVariants = {
  default: 'bg-background',
  outline: 'border border-border rounded-lg',
  muted: 'bg-muted rounded-lg'
}

const itemSizes = {
  default: 'p-4',
  sm: 'p-3',
  xs: 'p-2'
}

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof itemVariants
  size?: keyof typeof itemSizes
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-start gap-3',
        itemVariants[variant],
        itemSizes[size],
        'transition-colors',
        className
      )}
      {...props}
    />
  )
)
Item.displayName = 'Item'

interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'icon' | 'image'
}

const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex-shrink-0',
        variant === 'icon' && 'flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground',
        variant === 'image' && 'h-12 w-12 overflow-hidden rounded-md',
        className
      )}
      {...props}
    />
  )
)
ItemMedia.displayName = 'ItemMedia'

interface ItemContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ItemContent = React.forwardRef<HTMLDivElement, ItemContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex min-w-0 flex-1 flex-col gap-1', className)} {...props} />
  )
)
ItemContent.displayName = 'ItemContent'

interface ItemTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ItemTitle = React.forwardRef<HTMLHeadingElement, ItemTitleProps>(
  ({ className, ...props }, ref) => (
    <h4 ref={ref} className={cn('text-base font-medium leading-none truncate', className)} {...props} />
  )
)
ItemTitle.displayName = 'ItemTitle'

interface ItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ItemDescription = React.forwardRef<HTMLParagraphElement, ItemDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground truncate', className)} {...props} />
  )
)
ItemDescription.displayName = 'ItemDescription'

interface ItemActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

const ItemActions = React.forwardRef<HTMLDivElement, ItemActionsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-shrink-0 items-center gap-2', className)} {...props} />
  )
)
ItemActions.displayName = 'ItemActions'

interface ItemHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const ItemHeader = React.forwardRef<HTMLDivElement, ItemHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider', className)} {...props} />
  )
)
ItemHeader.displayName = 'ItemHeader'

interface ItemFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const ItemFooter = React.forwardRef<HTMLDivElement, ItemFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-2', className)} {...props} />
  )
)
ItemFooter.displayName = 'ItemFooter'

interface ItemSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const ItemSeparator = React.forwardRef<HTMLDivElement, ItemSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h-px bg-border', className)} {...props} />
  )
)
ItemSeparator.displayName = 'ItemSeparator'

export {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
  ItemSeparator
}
