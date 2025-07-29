import Navbar from '@/components/Home/Navbar'
import Menu from '@/components/Home/Menu'

import React from 'react'
import ContentPage from '@/components/Home/ContentPage'

const Home = () => {
  return (
    <div className=' w-full max-width mx-auto'>
      <Navbar />
      <Menu />
      <ContentPage />
    </div>
  )
}

export default Home
