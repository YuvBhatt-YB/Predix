import React from 'react'
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
const Menu = ({setActiveTab,activeTab}) => {
  return (
    <div className='border-b-1 '>
      <div className=" max-width mx-auto w-full font-secondary overflow-x-auto  no-scrollBar whitespace-nowrap touch-auto scroll-smooth">
        <div className="inline-flex min-w-max gap-6 px-2 py-4 lg:px-0">
          {components.map((component, index) => (
            <button
              key={index}
              className={` font-semibold  hover:text-primary cursor-pointer ${
                activeTab === component.tab
                  ? "text-primary"
                  : "text-secondaryGray"
              }`}
              onClick={() => setActiveTab(component.tab)}
            >
              <p>{component.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Menu
