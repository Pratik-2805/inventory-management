'use client'

import React, { useState, createContext, useContext, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SelectContextType {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

export function useSelect() {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('useSelect must be used within a Select')
  }
  return context
}

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, value = '', onValueChange, children, ...props }, ref) => {
    const [open, setOpen] = useState(false)
    const [localValue, setLocalValue] = useState(value)
    
    useEffect(() => {
      setLocalValue(value)
    }, [value])

    const handleValueChange = (val: string) => {
      setLocalValue(val)
      onValueChange?.(val)
      setOpen(false)
    }

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleOutsideClick)
      }
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
      }
    }, [open])

    return (
      <SelectContext.Provider value={{ open, setOpen, value: localValue, onValueChange: handleValueChange }}>
        <div 
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) (ref as any).current = node
            ;(containerRef as any).current = node
          }}
          className={cn('relative w-full', className)} 
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = 'Select'

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect()
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-left',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", open && "transform rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, children, className, ...props }, ref) => {
    const { value } = useSelect()
    return (
      <span ref={ref} className={cn('truncate', className)} {...props}>
        {value || children || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = 'SelectValue'

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelect()
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md min-w-[8rem]',
              className
            )}
            {...props}
          >
            <div className="p-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useSelect()
    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={() => onValueChange(value)}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          isSelected && 'bg-accent text-accent-foreground font-medium',
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        <span className="truncate">{children || value}</span>
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

const SelectNative = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative inline-flex w-full">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-8',
          className
        )}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
    </div>
  )
)
SelectNative.displayName = 'SelectNative'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectNative }
