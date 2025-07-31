import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'


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
    element:<Home />
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
