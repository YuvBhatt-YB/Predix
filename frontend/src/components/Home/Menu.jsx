import React from 'react'
import { Link } from 'react-router-dom'

const Menu = () => {
  return (
    <div>
      <p>This is the Menu</p>
      <Link to="/home/politics">Politics</Link>
      <Link to="/home/new">New</Link>
    </div>
  )
}

export default Menu
