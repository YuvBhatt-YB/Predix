import React from 'react'
import Navbar from '../components/Dashboard/Navbar'
import Stats from '../components/Dashboard/Stats'
import Navigation from '../components/Dashboard/Navigation'
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    <>
    <div className='w-full border-b-1 border-borderPrimary'>
      <Navbar/>
    </div>
    <div>
        <div className='max-width mx-auto'>
            <h1 className=' text-4xl font-main font-bold text-primary mt-9'>Welcome to <span className=' text-primaryBlue'>Predix</span> Admin Portal</h1>
            <Stats />
        </div>
    </div>
    <div>
        <div className='max-width mx-auto'>
            <Navigation />
            <div className=' my-5'>
                <Outlet />
            </div>
        </div>
    </div>
    </>
    
  )
}

export default Dashboard
