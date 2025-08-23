import * as React from 'react'
import { cn } from './cn'
type TabsCtx = { value: string, setValue: (v:string)=>void }
const Ctx = React.createContext<TabsCtx | null>(null)
export function Tabs({defaultValue, children}:{defaultValue: string, children?: React.ReactNode}){
  const [value, setValue] = React.useState(defaultValue)
  return <Ctx.Provider value={{value,setValue}}>{children}</Ctx.Provider>
}
export function TabsList({className, ...props}: React.HTMLAttributes<HTMLDivElement>){
  return <div className={cn('tablist', className)} {...props} />
}
export function TabsTrigger({value, children}:{value: string, children?: React.ReactNode}){
  const ctx = React.useContext(Ctx)!
  const active = ctx.value === value
  return <button className={cn('tab', active && 'tab-active')} onClick={()=>ctx.setValue(value)}>{children}</button>
}
export function TabsContent({value, children}:{value: string, children?: React.ReactNode}){
  const ctx = React.useContext(Ctx)!
  if(ctx.value !== value) return null
  return <div className="mt-3">{children}</div>
}
