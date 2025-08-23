
/** Very simple in-memory paper trading ledger for safe testing. */
type Order = { id: string, symbol: string, side: 'buy'|'sell', type:'market'|'limit', price?: number, amount: number, ts: number }
type Balance = Record<string, number>
const balances: Record<string, Balance> = {}
const orders: Record<string, Order[]> = {}

function getKey(exchange:string, apiKey?:string){ return `${exchange}:${apiKey || 'env'}` }

export function credit(exchange: string, apiKey: string | undefined, asset: string, amount: number){
  const k = getKey(exchange, apiKey)
  balances[k] = balances[k] || {}
  balances[k][asset] = (balances[k][asset] || 0) + amount
}
export function getBalance(exchange: string, apiKey?: string){
  const k = getKey(exchange, apiKey)
  return balances[k] || {}
}
export function place(exchange: string, apiKey: string | undefined, o: Order){
  const k = getKey(exchange, apiKey)
  orders[k] = orders[k] || []
  orders[k].push(o)
  // naive settlement: if buying X/USDT, deduct USDT and credit X at pseudo price
  const [base, quote] = o.symbol.split('/')
  const px = o.price || 100 // fake reference
  if(o.side === 'buy'){
    const cost = o.amount * px
    credit(exchange, apiKey, quote, -(cost))
    credit(exchange, apiKey, base, o.amount)
  }else{
    const proceeds = o.amount * px
    credit(exchange, apiKey, base, -(o.amount))
    credit(exchange, apiKey, quote, proceeds)
  }
  return o
}
