import React, { useState } from 'react'

import {dummyMarkets} from "../utils/dummyData"
import MarketBlock from '../components/Markets/MarketBlock'
const Markets = () => {
    const [markets,setMarkets] = useState(dummyMarkets)
  return (
    <div className=' grid grid-cols-3 gap-5'>
      {markets.map((market)=>(
        <MarketBlock key={market.id} market={market} />
      ))}
    </div>
  )
}

export default Markets
