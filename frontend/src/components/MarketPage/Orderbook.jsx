import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import OrderChart from './OrderChart'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon, InfoIcon } from "lucide-react"

const Orderbook = ({yesAsks,yesBids,noAsks,noBids,yesSpread,noSpread,marketPageError}) => {
  return (
      <Accordion
          type="single"
          collapsible
          className="w-full border-1 border-borderPrimary  rounded-medium mt-4 "
          defaultValue="item-1"
      >
          <AccordionItem value="item-1">
              <AccordionTrigger className="font-main text-primary hover:bg-light p-6">
                  Order Book
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance px-6 py-4">
                  {marketPageError.type === "orderBookData" ? (
                      <div>
                          <div className=" font-secondary">
                              {" "}
                              <Alert>
                                  <InfoIcon />
                                  <AlertTitle>
                                      Orderbook Data not available for this Market !
                                  </AlertTitle>
                              </Alert>
                          </div>
                      </div>
                  ) : (
                      <OrderChart
                          yesAsks={yesAsks}
                          yesBids={yesBids}
                          noAsks={noAsks}
                          noBids={noBids}
                          yesSpread={yesSpread}
                          noSpread={noSpread}
                      />
                  )}
              </AccordionContent>
          </AccordionItem>
      </Accordion>
  );
}

export default Orderbook
