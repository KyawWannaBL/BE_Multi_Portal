import React from 'react'
import { cn } from '@/lib/utils'

export interface AutoTranslateShellProps {
  children: React.ReactNode
  language?: string
  className?: string
}

function AutoTranslateShell({
  children,
  language = 'en',
  className,
}: AutoTranslateShellProps) {
  // Placeholder wrapper – connect real translation engine later
  return (
    <div
      data-language={language}
      className={cn('w-full', className)}
    >
      {children}
    </div>
  )
}

export { AutoTranslateShell }
export default AutoTranslateShell