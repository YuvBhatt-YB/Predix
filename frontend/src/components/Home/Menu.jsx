import { setActiveTab } from '@/state/activeTab/activeTab'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const components = [
  {title:"New",tab:"new"},
  {title:"Politics",tab:"politics"},
  {title:"Football",tab:"football"},
  {title:"Cricket",tab:"cricket"},
  {title:"Crypto",tab:"crypto"},
  {title:"Forex",tab:"forex"},
  {title:"Stocks",tab:"stocks"},
  {title:"Esports",tab:"esports"},
  {title:"World",tab:"world"},
  {title:"Tennis",tab:"tennis"}
]
const Menu = () => {
  const activeTab = useSelector((state)=>state.activeTab.active)
  const dispatch = useDispatch()
  return (
    <div className='border-b-1 '>
      <div className=" max-width mx-auto w-full font-secondary overflow-x-auto  no-scrollBar whitespace-nowrap touch-auto scroll-smooth">
        <div className="inline-flex min-w-max gap-6 px-2 py-4 lg:px-0">
          {components.map((component, index) => (
            <Link
            to="/home"
              key={index}
              className={` font-semibold  hover:text-primary cursor-pointer ${
                activeTab === component.tab
                  ? "text-primary"
                  : "text-secondaryGray"
              }`}
              onClick={() => dispatch(setActiveTab(component.tab))}
            >
              <p>{component.title}</p>
            </Link>
            
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu
