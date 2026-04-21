export interface KlineCandle {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  isClosed: boolean
}

export interface Order {
  orderId: number
  symbol: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT'
  status: string
  price: string
  origQty: string
  executedQty: string
  time: number
}
