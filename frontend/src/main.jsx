import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import News from './components/Home/News'
import Politics from './components/Home/Politics'
import Modal1 from './components/Home/Modal1'

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
    children:[{
      path:"/home/new",
      element:<News />
    },{
      path:"/home/politics",
      element:<Politics />,
      children:[{
        path:"/home/politics/modal1",
        element:<Modal1 />
      }]
    }]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
