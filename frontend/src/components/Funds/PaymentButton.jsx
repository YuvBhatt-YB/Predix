import React from 'react'
import { Button } from "@/components/ui/button"
const PaymentButton = ({icon,title,limit}) => {
  return (
    <Button variant="outline" disabled={true} size="lg">
                <div className=' flex justify-between items-center gap-6'>
                    <div className=' flex items-center gap-2'>
                        {icon}
                        <p>{title}</p>
                    </div>
                    <div>
                        <p>{limit ? limit : "No"} limit</p>
                    </div>
                </div>
    </Button>
  )
}

export default PaymentButton
