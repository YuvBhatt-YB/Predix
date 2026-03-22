import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
const OrderChart = ({yesAsks,yesBids,noAsks,noBids,yesSpread,noSpread,marketPageError}) => {
  const [orderBookType,setOrderBookType] = useState("YES")
  const visibleYesAsks = yesAsks.slice(0,20)
  const visibleYesBids = yesBids.slice(0,20)
  const visibleNoAsks = noAsks.slice(0,20)
  const visibleNoBids = noBids.slice(0,20)
  return (
    <div>
      <div>
        <div className=' flex gap-3 mb-2'>
          <button className={`font-main ${orderBookType === "YES" ? "text-primary" : "text-primaryGray"} font-bold cursor-pointer`}onClick={() => setOrderBookType("YES")}>Trade Yes</button>
          <button className={`font-main ${orderBookType === "NO" ? "text-primary" : "text-primaryGray"} text-primary font-bold cursor-pointer`} onClick={() => setOrderBookType("NO")}>Trade No</button>
        </div>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-secondary  text-primaryGray">TRADE {orderBookType}</TableHead>
              <TableHead className="font-secondary  text-primaryGray">PRICE</TableHead>
              <TableHead className="font-secondary  text-primaryGray">TOTAL</TableHead>
              <TableHead className="text-right font-secondary  text-primaryGray">SHARES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderBookType === "YES" && (
              visibleYesAsks && visibleYesAsks.map((ask) => (
                <TableRow key={ask.price}>
                  <TableCell className="font-medium  relative "><div className='absolute top-0 left-0  bg-[#FCEBEB] h-full transition-transform duration-120 ease-out w-full ' style={{transform: `scaleX(${ask.width/100})`,transformOrigin:"left"}}></div></TableCell>
                  <TableCell className="text-darkRed font-secondary font-bold">{ask.price * 100}¢</TableCell>
                  <TableCell className="text-primary font-secondary">$ {(ask.price * ask.quantity).toFixed(0)}</TableCell>
                  <TableCell className="text-right text-primary font-secondary">{ask.quantity}</TableCell>
                </TableRow>
              ))
              
            )}
            {orderBookType === "NO" && (
              visibleNoAsks && visibleNoAsks.map((ask) => (
                <TableRow key={ask.price}>
                  <TableCell className="font-medium  relative "><div className='absolute top-0 left-0  bg-[#FCEBEB] h-full transition-transform duration-120 ease-out w-full ' style={{transform: `scaleX(${ask.width/100})`,transformOrigin:"left"}}></div></TableCell>
                  <TableCell className="text-darkRed font-secondary font-bold">{ask.price * 100}¢</TableCell>
                  <TableCell className="text-primary font-secondary">$ {(ask.price * ask.quantity).toFixed(0)}</TableCell>
                  <TableCell className="text-right text-primary font-secondary">{ask.quantity}</TableCell>
                </TableRow>
              ))
              
            )}
          </TableBody>
          
        </Table>
      </div>
      <div className=' my-2'>
        <Table>
            <TableFooter className="border-none" >
            <TableRow >
              <TableCell colSpan={3} className="text-primaryGray">Spread</TableCell>
              <TableCell className="text-right text-primaryGray">{orderBookType === "YES" ? yesSpread === null ? "-" : `${(yesSpread*100).toFixed(0)}¢` : noSpread === null ? "-" : `${(noSpread*100).toFixed(0)}¢`}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-secondary  text-primaryGray"></TableHead>
              <TableHead className="font-secondary  text-primaryGray">PRICE</TableHead>
              <TableHead className="font-secondary  text-primaryGray">TOTAL</TableHead>
              <TableHead className="text-right font-secondary  text-primaryGray">SHARES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderBookType === "YES" && (
              visibleYesBids && visibleYesBids.map((bid) => (
                <TableRow key={bid.price}>
                  <TableCell className="font-medium  relative "><div className='absolute top-0 left-0  bg-[#EAF5EE] h-full transition-transform duration-120 ease-out w-full ' style={{transform: `scaleX(${bid.width/100})`,transformOrigin:"left"}}></div></TableCell>
                  <TableCell className="text-darkGreen font-secondary font-bold">{bid.price * 100}¢</TableCell>
                  <TableCell className="text-primary font-secondary">$ {(bid.price * bid.quantity).toFixed(0)}</TableCell>
                  <TableCell className="text-right text-primary font-secondary">{bid.quantity}</TableCell>
                </TableRow>
              ))
              
            )}
            {orderBookType === "NO" && (
              visibleNoBids && visibleNoBids.map((bid) => (
                <TableRow key={bid.price}>
                  <TableCell className="font-medium  relative "><div className='absolute top-0 left-0  bg-[#EAF5EE] h-full transition-transform duration-120 ease-out w-full ' style={{transform: `scaleX(${bid.width/100})`,transformOrigin:"left"}}></div></TableCell>
                  <TableCell className="text-darkGreen font-secondary font-bold">{bid.price * 100}¢</TableCell>
                  <TableCell className="text-primary font-secondary">$ {(bid.price * bid.quantity).toFixed(0)}</TableCell>
                  <TableCell className="text-right text-primary font-secondary">{bid.quantity}</TableCell>
                </TableRow>
              ))
              
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default OrderChart