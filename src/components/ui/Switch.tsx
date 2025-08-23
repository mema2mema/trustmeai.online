import * as React from 'react'
type Props = { checked?: boolean, onCheckedChange?: (v:boolean)=>void, id?: string }
export function Switch({checked=false, onCheckedChange, id}: Props){
  return (
    <label htmlFor={id} className="inline-flex items-center cursor-pointer select-none">
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={e=>onCheckedChange?.(e.target.checked)} />
      <div className={\`w-10 h-6 rounded-full transition \${checked?'bg-emerald-600':'bg-slate-300'}\`}>
        <div className={\`w-5 h-5 bg-white rounded-full mt-0.5 transition \${checked?'translate-x-5':'translate-x-0.5'}\`}></div>
      </div>
    </label>
  )
}