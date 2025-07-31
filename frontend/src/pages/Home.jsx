import Navbar from '@/components/Home/Navbar'
import Menu from '@/components/Home/Menu'

import React, { useState } from 'react'
import ContentPage from '@/components/Home/ContentPage'

const Home = () => {
  const [activeTab,setActiveTab] = useState("new")
  return (
    <div className=' w-full max-width mx-auto'>
      <Navbar />
      <Menu setActiveTab={setActiveTab} activeTab={activeTab}/>
      <ContentPage activeTab={activeTab} />
    </div>
  )
}

export default Home
