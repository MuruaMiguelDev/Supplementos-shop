'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------
   Contexto interno para compartir value y onChange
------------------------------------------------------- */
type RGContextType = {
  name: string
  value: string
  setValue: (v: string) => void
}
const RGContext = React.createContext<RGContextType | null>(null)

function useRG() {
  const ctx = React.useContext(RGContext)
  if (!ctx) throw new Error('RadioGroupItem must be used within <RadioGroup>')
  return ctx
}

/* -------------------------------------------------------
   Root
------------------------------------------------------- */
type RootProps = {
  value: string
  onValueChange: (v: string) => void
  name?: string
  className?: string
  children: React.ReactNode
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RootProps>(
  ({ value, onValueChange, name, className, children }, ref) => {
    // 👇 generamos el ID una sola vez fuera de useMemo
    const generatedId = React.useId()

    const setValue = React.useCallback(
      (v: string) => {
        if (v !== value) onValueChange(v)
      },
      [onValueChange, value]
    )

    // Creamos el contexto con valores estables
    const ctx = React.useMemo(
      () => ({
        name: name || `rg-${generatedId}`,
        value,
        setValue,
      }),
      [name, value, setValue, generatedId]
    )

    return (
      <RGContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn('grid gap-3', className)}
          data-slot="radio-group"
        >
          {children}
        </div>
      </RGContext.Provider>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

/* -------------------------------------------------------
   Item
   - Renderiza un <input type="radio"> oculto (accesible)
   - Un <button type="button"> estilizado como radio
------------------------------------------------------- */
type ItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
  id?: string
  className?: string
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ value, id, className, ...props }, ref) => {
    const { name, value: groupValue, setValue } = useRG()
    const checked = groupValue === value

    return (
      <div className="relative inline-flex items-center">
        {/* input accesible para forms / screen readers */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => setValue(value)}
          className="sr-only"
        />
        {/* botón visual */}
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={checked}
          data-slot="radio-group-item"
          onClick={() => setValue(value)}
          className={cn(
            'aspect-square size-4 shrink-0 rounded-full border border-input shadow-xs outline-none transition-[color,box-shadow]',
            'text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-[checked=true]:ring-[3px] aria-[checked=true]:ring-ring/50',
            'dark:bg-input/30',
            className
          )}
          {...props}
        >
          <span
            aria-hidden
            className={cn(
              'block size-2 rounded-full',
              checked ? 'bg-current' : 'bg-transparent'
            )}
          />
        </button>
      </div>
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'
