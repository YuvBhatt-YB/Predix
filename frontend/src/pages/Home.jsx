import Navbar from '@/components/Home/Navbar'
import Menu from '@/components/Home/Menu'

import React, { useState } from 'react'
import ContentPage from '@/components/Home/ContentPage'

const Home = () => {
  const [activeTab,setActiveTab] = useState("new")
  return (
    <div>
      <div className=' w-full bg-white sticky top-0 z-50'>
        <Navbar />
        <Menu setActiveTab={setActiveTab} activeTab={activeTab}/>
      </div>
      <ContentPage activeTab={activeTab} />
    </div>
  )
}

export default Home
