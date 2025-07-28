import React, { useState } from 'react'
import {dummyMarkets} from "../utils/dummyData"
import ResolveMarketBlock from '../components/ResolveMarkets/ResolveMarketBlock'
const ResolveMarkets = () => {
  const [resolvedMarkets,setResolvedMarkets] = useState(dummyMarkets)
  return (
    <div>
       <div className=' grid grid-cols-3 gap-5 grid-rows-1'>
      {resolvedMarkets.map((market)=>(
        <ResolveMarketBlock key={market.id} market={market} />
      ))}
    </div>
    </div>
  )
}

export default ResolveMarkets
