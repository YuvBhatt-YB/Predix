import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Markets from './pages/Markets.jsx'
import ResolveMarkets from './pages/ResolveMarkets.jsx'
import NewMarket from './pages/NewMarket.jsx'
import Error from './pages/Error.jsx'

const router = createBrowserRouter([
  {
    path:'/',
    element:<Dashboard />,
    errorElement:<Error />,
    children:[
      {
        index:true,
        element:<Markets />
      },
      {
        path:"all-markets",
        element:<Markets />
      },
      {
        path:'create-market',
        element:<NewMarket />
      },
      {
        path:'resolve-market',
        element:<ResolveMarkets />
      }
    ]
  },
  {
    path:"login",
    element:<Login/>
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
