"use client"

import { OrderBookView } from "@/components/orderbook/order-book-view"
import { TradesView } from "@/components/orderbook/trades-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type OrderBookTab = "orders" | "trades"

interface Props {
  value: OrderBookTab
  onValueChange: (v: OrderBookTab) => void
}

export function OrderBookTabs({ value, onValueChange }: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as OrderBookTab)}
      className="gap-0 px-0"
    >
      <TabsList variant="line">
        <TabsTrigger value="orders">Order Book</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
      </TabsList>
      <TabsContent value="orders">
        <OrderBookView />
      </TabsContent>
      <TabsContent value="trades">
        <TradesView />
      </TabsContent>
    </Tabs>
  )
}
