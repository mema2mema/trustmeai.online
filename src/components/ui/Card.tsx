import * as React from 'react'
import { cn } from './cn'
export function Card({className, ...props}: React.HTMLAttributes<HTMLDivElement>){ return <div className={cn('card', className)} {...props} /> }
export function CardHeader({className, ...props}: React.HTMLAttributes<HTMLDivElement>){ return <div className={cn('border-b border-slate-100 p-4', className)} {...props} /> }
export function CardTitle({className, ...props}: React.HTMLAttributes<HTMLDivElement>){ return <div className={cn('font-semibold', className)} {...props} /> }
export function CardContent({className, ...props}: React.HTMLAttributes<HTMLDivElement>){ return <div className={cn('p-4', className)} {...props} /> }
