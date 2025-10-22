import * as React from 'react'
import { cn } from 'src/misc/cn'

interface TooltipProps {
  className?: string
  content: string | React.ReactNode
  disabled?: boolean
  onClick?: () => void
  variant?: 'dark' | 'light'
}

const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
  className,
  content,
  disabled = false,
  variant = 'light',
  onClick,
  children,
}) => {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div
        className={cn('invisible absolute rounded shadow-lg flex justify-center items-center ', className, {
          'bg-white text-black': variant === 'light',
          'bg-black text-white': variant === 'dark',
          'group-hover:visible group-hover:z-50': !disabled,
        })}
      >
        {content}
      </div>
      {children}
    </div>
  )
}

export default Tooltip
