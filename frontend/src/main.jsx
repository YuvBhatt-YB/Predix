import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
