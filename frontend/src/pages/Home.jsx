import Navbar from '@/components/Home/Navbar'
import Menu from '@/components/Home/Menu'

import React from 'react'

import { Outlet } from 'react-router-dom'

const Home = () => {
  
  return (
    <div>
      <div className=' w-full bg-white sticky top-0 z-50'>
        <Navbar />
        <Menu />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default Home
