import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import LoadingPage from '../ui/LoadingPage'

const ProtectedRoute = ({children}) => {
    const {userData,loading} = useSelector((state)=>state.user)
    if(loading) return <LoadingPage />

    if(userData === undefined) return <Navigate to="/login" replace />

    return children
}

export default ProtectedRoute
