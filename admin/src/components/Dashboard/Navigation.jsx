import React from 'react'
import { NavLink } from 'react-router-dom'
import NavigationLink from './NavigationLink'

const Navigation = () => {
  return (
    <div className=' font-secondary font-semibold text-secondaryGray text-xs flex pb-5 border-b-1 border-borderPrimary'>
      <NavigationLink title="All Markets" path="all-markets" />
      <NavigationLink title="Create Market" path="create-market"/>
      <NavigationLink title="Resolve Market" path="resolve-market"/>
    </div>
  )
}

export default Navigation
