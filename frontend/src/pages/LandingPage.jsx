import React from 'react'
import Navbar from '../components/LandingPage/Navbar'
import HeroSection from '@/components/LandingPage/HeroSection'
import About from '@/components/LandingPage/About'
import Demo from '@/components/LandingPage/Demo'
import NewsLetter from '@/components/LandingPage/NewsLetter'

const LandingPage = () => {
  return (
    <div>
    <div className=' w-full max-width mx-auto '>
        <Navbar />
    </div>
    <HeroSection />
    <div className=' w-full max-width mx-auto '>
        <About />
        <Demo />
    </div>
    <NewsLetter />
    </div>
  )
}

export default LandingPage
