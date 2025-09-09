import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Profile from './components/Home/Profile'
import Markets from './components/Home/Markets'
import MarketPage from './pages/MarketPage'
import {Provider, useDispatch} from "react-redux"
import { store } from './state/store'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { getUserData } from './state/user/user'

import LoadingPage from './components/ui/LoadingPage'
import Funds from './pages/Funds'

const router = createBrowserRouter([
  {
    path:"/",
    element:<LandingPage />
  },
  {
    path:"/login",
    element:<Login />
  },
  {
    path:"/signup",
    element:<Signup />
  },
  {
    path:"/home",
    element:<ProtectedRoute><Home /></ProtectedRoute>,
    children:[
      {
        index:true,
        element:<Markets />,
        
      },
      {
        path:"profile",
        element:<Profile />
      },
      {
        path:":marketId",
        element:<MarketPage />
      }
    ]
  },
  {
    path:"/funds",
    element:<ProtectedRoute><Funds /></ProtectedRoute>
  }
])

function AppInitializer(){
  const dispatch = useDispatch()

  useEffect(()=> {
    dispatch(getUserData())
  },[dispatch])

  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}><AppInitializer /></Provider>
    
  </StrictMode>,
)
