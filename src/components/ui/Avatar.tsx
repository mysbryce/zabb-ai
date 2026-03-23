export function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }

  const baseClasses = 'relative inline-flex items-center justify-center overflow-hidden rounded-full border border-zabb-border bg-zabb-muted shrink-0'
  const fallbackText = alt ? alt.charAt(0).toUpperCase() : '?'

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-zabb-fg font-medium">{fallbackText}</span>
      )}
    </div>
  )
}
