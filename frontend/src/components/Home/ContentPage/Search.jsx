import React from 'react'
import { Input } from "@/components/ui/input"
import { CiSearch } from "react-icons/ci";
import { HiMiniSlash } from "react-icons/hi2";
import { useDispatch, useSelector } from 'react-redux';

import { setSearchQuery } from '@/state/markets/markets';

const Search = () => {
  const searchVal = useSelector((state) => state.markets.searchQuery)
  const dispatch = useDispatch()
  return (
    <div className='flex items-center w-full md:w-1/2 px-1 gap-1 bg-search text-secondaryGray font-secondary rounded-small my-2 '>
        <p className='text-xl'><CiSearch /></p>
        <Input type="text" placeholder="Search" className="text-primary shadow-none border-none rounded-none focus:border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:py-6" onChange={(e)=>dispatch(setSearchQuery(e.target.value))}  value={searchVal} />
        <p className='text-xl'><HiMiniSlash /></p>
    </div>
  )
}

export default Search
