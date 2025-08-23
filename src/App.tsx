import React, {useMemo, useState, useEffect} from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Calculator as CalcIcon, ShieldCheck, TrendingUp, Rocket, Languages, Mail, Phone } from 'lucide-react'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Input } from './components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs'
import { Switch } from './components/ui/Switch'
import { Label } from './components/ui/Label'

const fmt = (n:number)=> new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(n||0))
const clamp = (n:any, min:number, max:number)=> Math.min(Math.max(Number(n||0),min),max)

type ProjArgs = { principal:number, dailyPct:number, days:number, reinvest:boolean, withdrawEvery:number, reinvestCap:number }
function project({ principal, dailyPct, days, reinvest, withdrawEvery, reinvestCap }: ProjArgs){
  principal=Number(principal||0); dailyPct=Number(dailyPct||0); days=Math.max(1,Math.min(365,Number(days||1)))
  withdrawEvery=Number(withdrawEvery||0); reinvestCap=Number(reinvestCap||0)
  let balance = principal; let totalWithdrawn = 0;
  const data: any[] = []
  for(let d=1; d<=days; d++){
    const profit = balance * (dailyPct/100)
    let withdrawn = 0
    if(!reinvest){ withdrawn = profit; totalWithdrawn += withdrawn }
    else{
      if(reinvestCap>0 && balance>=reinvestCap){ withdrawn = profit; totalWithdrawn += withdrawn }
      else{ balance += profit }
    }
    if(withdrawEvery>0 && d%withdrawEvery===0){}
    data.push({ day:d, balance: Number(balance.toFixed(2)), withdrawn: Number(totalWithdrawn.toFixed(2)) })
  }
  return { data, finalBalance: balance, totalWithdrawn }
}

function ProfitCalculator(){
  const [amount, setAmount] = useState(1000)
  const [dailyPct, setDailyPct] = useState(1.2)
  const [days, setDays] = useState(120)
  const [reinvest, setReinvest] = useState(true)
  const [reinvestCap, setReinvestCap] = useState(10000)
  const [withdrawEvery, setWithdrawEvery] = useState(0)

  const { data, finalBalance, totalWithdrawn } = useMemo(()=> project({principal:amount,dailyPct,days,reinvest,withdrawEvery,reinvestCap}),[amount,dailyPct,days,reinvest,withdrawEvery,reinvestCap])
  const totalProfit = reinvest ? finalBalance - amount : totalWithdrawn

  return (
    <Card className="w-full border border-gray-200 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl"><CalcIcon className="w-5 h-5"/> Live Profit & Withdrawal Calculator</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 items-center">
            <Label htmlFor="amount">Investment (USDT)</Label>
            <Input id="amount" type="number" min={0} value={amount} onChange={(e)=>setAmount(clamp(e.target.value,0,1_000_000_000))}/>
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <Label htmlFor="daily">Daily Profit %</Label>
            <Input id="daily" type="number" step="0.01" min={0} max={1000} value={dailyPct} onChange={(e)=>setDailyPct(clamp(e.target.value,0,1000))}/>
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <Label htmlFor="days">Days (1–365)</Label>
            <Input id="days" type="number" min={1} max={365} value={days} onChange={(e)=>setDays(clamp(e.target.value,1,365))}/>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Switch id="reinvest" checked={reinvest} onCheckedChange={setReinvest}/>
              <Label htmlFor="reinvest">Auto‑Reinvest</Label>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor="cap">Reinvest Cap</Label>
              <Input id="cap" type="number" min={0} value={reinvestCap} onChange={(e)=>setReinvestCap(clamp(e.target.value,0,1_000_000_000))}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <Label htmlFor="we">Withdraw Every (days, 0 = off)</Label>
            <Input id="we" type="number" min={0} max={365} value={withdrawEvery} onChange={(e)=>setWithdrawEvery(clamp(e.target.value,0,365))}/>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn btn-outline" onClick={()=>{ setAmount(1000); setDailyPct(1.2); setDays(120); setReinvest(true); setReinvestCap(10000); setWithdrawEvery(0);}}>Reset</button>
          </div>
          <div className="text-sm text-slate-500">Results are simulations for education only. Not financial advice.</div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center"><div className="text-xs text-slate-500">Final Balance</div><div className="text-2xl font-semibold">${fmt(finalBalance)}</div></Card>
            <Card className="p-4 text-center"><div className="text-xs text-slate-500">Total Profit</div><div className="text-2xl font-semibold">${fmt(totalProfit)}</div></Card>
            <Card className="p-4 text-center"><div className="text-xs text-slate-500">Total Withdrawn</div><div className="text-2xl font-semibold">${fmt(totalWithdrawn)}</div></Card>
            <Card className="p-4 text-center"><div className="text-xs text-slate-500">Initial Investment</div><div className="text-2xl font-semibold">${fmt(amount)}</div></Card>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={(v)=>`D${v}`}/>
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v)=>`$${fmt(Number(v))}`}/>
                <Tooltip formatter={(v:any, n:any)=> n==='balance' ? `$${fmt(Number(v))}` : `$${fmt(Number(v))}`} labelFormatter={(l:any)=>`Day ${l}`}/>
                <Area type="monotone" dataKey="balance" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="withdrawn" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const dict:any = {
  en: { heroTitle: 'TrustMe AI', heroSubtitle: 'Smarter trading. Transparent performance.' },
  te: { heroTitle: 'ట్రస్ట్‌మీ AI', heroSubtitle: 'తెలివైన ట్రేడింగ్. స్పష్టమైన ఫలితాలు.' },
  da: { heroTitle: 'TrustMe AI', heroSubtitle: 'Klog handel. Gennemsigtig performance.' }
}
function useAutoLang(){
  const [lang, setLang] = useState('en')
  useEffect(()=>{ const n = navigator?.language?.slice(0,2).toLowerCase(); if(['te','da','en'].includes(n)) setLang(n) },[])
  return dict[lang] || dict.en
}

export default function App(){
  const t = useAutoLang()
  const features = [
    { icon: <ShieldCheck className="w-5 h-5"/>, title: "Transparency First", text: "Live logs, profit history, and optional TXIDs for auditability." },
    { icon: <TrendingUp className="w-5 h-5"/>, title: "Smart Adjustments", text: "AI realism & risk controls that adapt to market conditions." },
    { icon: <Rocket className="w-5 h-5"/>, title: "Auto‑Reinvest", text: "Let compound growth work with caps and toggles you control." },
  ]
  const plans = [
    { d: 1, label: "1 Day" }, { d: 7, label: "7 Days" }, { d: 30, label: "30 Days" },
    { d: 60, label: "60 Days" }, { d: 90, label: "90 Days" }, { d: 120, label: "120 Days" },
  ]
  const hotCoins = [
    {s:'ETH', p:4744.4, ch:-1.81433}, {s:'BTC', p:115963.63, ch:-0.83154}, {s:'SOL', p:204.86, ch: 2.07783},
    {s:'XRP', p:3.0344, ch:-1.30427}, {s:'BNB', p:887.14, ch:-1.45078}, {s:'ADA', p:0.9135, ch:-1.93326},
    {s:'LINK',p:26.12, ch:-2.53731}, {s:'DOT', p:4.128, ch:-1.26763},
  ]
  const topGainers = hotCoins.slice().sort((a,b)=>b.ch-a.ch).slice(0,5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">T</div>
            <span className="font-semibold">TrustMe AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#calculator" className="hover:underline">Calculator</a>
            <a href="#plans" className="hover:underline">Plans</a>
            <a href="#referrals" className="hover:underline">Referrals</a>
            <a href="#faq" className="hover:underline">FAQ</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
          <button className="btn btn-default rounded-2xl">Get Started</button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-4 gap-3 text-sm">
        {['Top‑Up','Withdraw','Help Center','Platform Intro'].map((x,i)=>(
          <a key={i} className="rounded-2xl border border-slate-200 p-3 flex flex-col items-center hover:bg-slate-50" href="#">
            <span className="text-emerald-600">{['💳','💸','❓','📚'][i]}</span><span className="mt-1 font-medium">{x}</span>
          </a>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {t.heroTitle}: <span className="text-slate-500">{t.heroSubtitle}</span>
            </motion.h1>
            <p className="mt-4 text-slate-600 max-w-prose">Real-time performance dashboards, telegram alerts, and a clean admin panel. See profits, withdrawals, and compounding with our live calculator.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-default rounded-2xl">Launch App</button>
              <button className="btn btn-outline rounded-2xl"><span className="mr-2">🌐</span> Auto Language</button>
            </div>
            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {[
                {icon:'🛡️', title:'Transparency First', text:'Live logs, profit history, and optional TXIDs for auditability.'},
                {icon:'📈', title:'Smart Adjustments', text:'AI realism & risk controls that adapt to market conditions.'},
                {icon:'🚀', title:'Auto‑Reinvest', text:'Let compound growth work with caps and toggles you control.'},
              ].map((f,i)=>(
                <div key={i} className="card p-4">
                  <div className="flex items-center gap-2 text-slate-700"><span>{f.icon}</span><span className="font-medium">{f.title}</span></div>
                  <p className="text-sm text-slate-600 mt-2">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>{React.createElement(ProfitCalculator)}</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-600 text-xs">TOP3 Of The Strategies</div>
            <h2 className="text-lg font-semibold">Experience Gold Strategy</h2>
          </div>
          <a className="px-3 py-2 rounded-xl border text-sm hover:bg-slate-50" href="#learn">Learn More</a>
        </div>
        <div className="card mt-3 p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="badge bg-emerald-50 text-emerald-700">USDT</div>
            <div className="badge bg-slate-100">ETH</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div><div className="text-emerald-600 font-bold">1% ~ 2%</div><div className="text-xs text-slate-500">Daily Yield</div></div>
            <div><div className="font-semibold">4.3738M</div><div className="text-xs text-slate-500">Participate Assets</div></div>
            <div><div className="font-semibold">12914</div><div className="text-xs text-slate-500">Users</div></div>
          </div>
        </div>
      </section>

      <section id="plans" className="bg-white border-y border-gray-100 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">Investment Plans</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {['1 Day','7 Days','30 Days','60 Days','90 Days','120 Days'].map((label,i)=>(
              <div key={i} className="card">
                <div className="border-b border-slate-100 p-4 font-semibold">{label}</div>
                <div className="p-4 text-sm text-slate-600">Simulate with the calculator and choose the plan that fits your goals (1 to 120 days supported, up to 365 in simulator).</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <h3 className="text-center text-sm text-emerald-700">Partners</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 mt-4 text-slate-400 place-items-center">
          <div>Bitget</div><div>eToro</div><div>Gate</div><div>BINANCE</div><div>OKX</div><div>KUCOIN</div>
          <div>KRAKEN</div><div>BYBIT</div><div>GEMINI</div><div>crypto.com</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <h3 className="text-center text-lg font-semibold">Our Advantages</h3>
        <div className="grid sm:grid-cols-3 gap-6 mt-6 text-center">
          <div className="p-4"><div className="text-3xl">🛡️</div><div className="font-semibold mt-2">Transparent Security</div><p className="text-sm text-slate-600 mt-1">Every transaction is traceable. Funds are secure.</p></div>
          <div className="p-4"><div className="text-3xl">🤖</div><div className="font-semibold mt-2">Automated Trading</div><p className="text-sm text-slate-600 mt-1">24/7 execution, no manual intervention required.</p></div>
          <div className="p-4"><div className="text-3xl">📈</div><div className="font-semibold mt-2">Real‑Time Data</div><p className="text-sm text-slate-600 mt-1">Access to major global markets with fast updates.</p></div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-10 pb-24">
        <div className="card mb-3">
          <div className="border-b border-slate-100 p-4 font-semibold">🔥 Hot List</div>
          <div className="p-4 divide-y">
            {hotCoins.map((c,i)=>(
              <div key={i} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center">{c.s[0]}</div>
                  <div className="font-medium">{c.s} <span className="text-xs text-slate-500">USDT</span></div>
                </div>
                <div className={c.ch>=0?'text-emerald-600 font-semibold':'text-rose-600 font-semibold'}>{c.ch>=0?'+':''}{c.ch.toFixed(5)}%</div>
                <div className="w-24 text-right">{fmt(c.p)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="border-b border-slate-100 p-4 font-semibold">🏆 Top Gainers</div>
          <div className="p-4 divide-y">
            {topGainers.map((c,i)=>(
              <div key={i} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center">{c.s[0]}</div>
                  <div className="font-medium">{c.s} <span className="text-xs text-slate-500">USDT</span></div>
                </div>
                <div className={c.ch>=0?'text-emerald-600 font-semibold':'text-rose-600 font-semibold'}>{c.ch>=0?'+':''}{c.ch.toFixed(5)}%</div>
                <div className="w-24 text-right">{fmt(c.p)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Contact</h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3 text-slate-700">
            <p className="flex items-center gap-2">✉️ support@trustmeai.online</p>
            <p className="flex items-center gap-2">📞 +45 00 00 00 00</p>
            <p className="text-sm text-slate-500">We usually respond within 24 hours.</p>
          </div>
          <div className="card">
            <div className="border-b border-slate-100 p-4 font-semibold">Send us a message</div>
            <div className="p-4">
              <form onSubmit={(e)=>{e.preventDefault(); alert("Thanks! We'll get back to you at support@trustmeai.online")}} className="space-y-3">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="label">Name</label>
                  <div className="col-span-2"><input required placeholder="Your name" className="input"/></div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="label">Email</label>
                  <div className="col-span-2"><input required type="email" placeholder="you@example.com" className="input"/></div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-start">
                  <label className="label">Message</label>
                  <div className="col-span-2"><textarea required className="w-full border rounded-2xl p-2 h-28 outline-none focus:ring" placeholder="How can we help?"></textarea></div>
                </div>
                <button type="submit" className="btn btn-default rounded-2xl">Send</button>
                <p className="text-xs text-slate-500">This demo form triggers an alert. Wire it to support@trustmeai.online on production.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-6">
          <div>
            <div className="w-9 h-9 rounded-2xl bg-white/10 grid place-items-center font-bold">T</div>
            <p className="text-sm text-slate-300 mt-3">© {new Date().getFullYear()} TrustMe AI. All rights reserved.</p>
          </div>
          <div><div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1 text-sm text-slate-300">
              <li><a href="#" className="hover:underline">About</a></li>
              <li><a href="#" className="hover:underline">Terms</a></li>
              <li><a href="#" className="hover:underline">Privacy</a></li>
            </ul>
          </div>
          <div><div className="font-semibold mb-2">Product</div>
            <ul className="space-y-1 text-sm text-slate-300">
              <li><a href="#calculator" className="hover:underline">Calculator</a></li>
              <li><a href="#plans" className="hover:underline">Plans</a></li>
              <li><a href="#referrals" className="hover:underline">Referrals</a></li>
            </ul>
          </div>
          <div><div className="font-semibold mb-2">Help</div>
            <ul className="space-y-1 text-sm text-slate-300">
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <nav className="fixed bottom-0 inset-x-0 border-t bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-5 text-center text-xs">
          <a className="py-3 text-emerald-600">🏠<div>Front Page</div></a>
          <a className="py-3">💼<div>Assets</div></a>
          <a className="py-3">📊<div>Strategy</div></a>
          <a className="py-3">👥<div>Team</div></a>
          <a className="py-3">👤<div>Mine</div></a>
        </div>
      </nav>
    </div>
  )
}
