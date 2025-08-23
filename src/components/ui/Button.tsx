import * as React from 'react'
import { cn } from './cn'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }
export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button({variant='default', className, ...props}, ref){
  return <button ref={ref} className={cn('btn', variant==='default' ? 'btn-default' : 'btn-outline', className)} {...props} />
})