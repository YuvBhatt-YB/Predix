import React from 'react'
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
const OrderChart = () => {
  return (
    <div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] font-secondary  text-primaryGray">TRADE YES</TableHead>
              <TableHead className="font-secondary  text-primaryGray">PRICE</TableHead>
              <TableHead className="font-secondary  text-primaryGray">TOTAL</TableHead>
              <TableHead className="text-right font-secondary  text-primaryGray">SHARES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium"></TableCell>
              <TableCell className="text-darkGreen font-secondary">$ 1</TableCell>
              <TableCell className="text-primary font-secondary">$ 299</TableCell>
              <TableCell className="text-right text-primary font-secondary">299</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium"></TableCell>
              <TableCell className="text-darkGreen font-secondary">$ 1.05</TableCell>
              <TableCell className="text-primary font-secondary">$ 1333</TableCell>
              <TableCell className="text-right text-primary font-secondary">1333</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium"></TableCell>
              <TableCell className="text-darkGreen font-secondary">$ 1.15</TableCell>
              <TableCell className="text-primary font-secondary">$ 140</TableCell>
              <TableCell className="text-right text-primary font-secondary">140</TableCell>
            </TableRow>
          </TableBody>
          
        </Table>
      </div>
      <div className=' my-2'>
        <Table>
            <TableFooter className="border-none" >
            <TableRow >
              <TableCell colSpan={3} className="text-primaryGray">Spread</TableCell>
              <TableCell className="text-right text-primaryGray">$0.4</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] font-secondary  text-primaryGray">TRADE NO</TableHead>
              <TableHead className="font-secondary  text-primaryGray">PRICE</TableHead>
              <TableHead className="font-secondary  text-primaryGray">TOTAL</TableHead>
              <TableHead className="text-right font-secondary  text-primaryGray">SHARES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium"></TableCell>
              <TableCell className="text-darkRed font-secondary">$ 1</TableCell>
              <TableCell className="text-primary font-secondary">$ 299</TableCell>
              <TableCell className="text-right text-primary font-secondary">299</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium"></TableCell>
              <TableCell className="text-darkRed font-secondary">$ 1.05</TableCell>
              <TableCell className="text-primary font-secondary">$ 1333</TableCell>
              <TableCell className="text-right text-primary font-secondary">1333</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium"></TableCell>
              <TableCell className="text-darkRed font-secondary">$ 1.15</TableCell>
              <TableCell className="text-primary font-secondary">$ 140</TableCell>
              <TableCell className="text-right text-primary font-secondary">140</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default OrderChart