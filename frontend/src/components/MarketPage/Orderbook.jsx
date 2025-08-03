import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import OrderChart from './OrderChart'

const Orderbook = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border-1 border-borderPrimary  rounded-medium mt-4 "
      defaultValue="item-1" 
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="font-main text-primary hover:bg-light p-6">Order Book</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance p-6">
          <OrderChart />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default Orderbook
