import { OrderBookWidget } from "@/components/orderbook/order-book-widget"

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 bg-background">
      <OrderBookWidget />
    </main>
  )
}
