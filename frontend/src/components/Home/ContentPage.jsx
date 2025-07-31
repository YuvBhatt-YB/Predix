import React from 'react'
import { Outlet } from 'react-router-dom'

const ContentPage = ({activeTab}) => {
  return (
    <div>
      <h1>{activeTab}</h1>
    </div>
  )
}

export default ContentPage
