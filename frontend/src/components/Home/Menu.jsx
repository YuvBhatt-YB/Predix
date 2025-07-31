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
  {title:"Tennis",tab:"tennis"},
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
    <div className="border-1 py-4 flex gap-6 font-secondary overflow-x-auto px-2 md:px-0 no-scrollBar">
      {components.map((component,index)=>(
        <button key={index} className={` font-semibold  hover:text-primary cursor-pointer ${activeTab === component.tab ? "text-primary":"text-secondaryGray"}`} onClick={()=>setActiveTab(component.tab)}>
          <p>{component.title}</p>
        </button>
      ))}
    </div>
  );
}

export default Menu
