import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const Politics = () => {
  return (
    <div>
      <h1>This is Politis Page</h1>
      <Link to="/home/politics/modal1">This is Politics Component 1</Link>
      <Outlet />
    </div>
  )
}

export default Politics
