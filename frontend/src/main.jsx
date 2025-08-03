import { StrictMode } from 'react'
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
    element:<Home />,
    children:[
      {
        index:true,
        element:<Markets />
      },
      {
        path:"profile",
        element:<Profile />
      },
      {
        path:":id",
        element:<MarketPage />
      }
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
