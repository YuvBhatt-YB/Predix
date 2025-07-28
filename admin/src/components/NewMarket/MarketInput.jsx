import React from 'react'

const MarketInput = ({id,label,type,options,placeholder,name,handleChange,value}) => {
    let input;
    if(type==="text"){
        input = <input type="text" value={value || ""} name={name} id={id} placeholder={placeholder} className=' w-[435px] border-1 border-borderPrimary text-primary rounded-small px-2 py-3 focus:outline-hoverBorderPrimary text-small' onChange={handleChange}/>
    }else if (type==="datetime"){
        input = <input type="datetime-local" value={value} name={name} id={id} className=' py-3 px-5 font-semibold text-textGray rounded-small border-1 border-borderPrimary focus:outline-hoverBorderPrimary text-small' onChange={handleChange} />
    }else if (type === "options"){
        input = (
            <select value={value} name={name} className=' py-3 px-5 font-semibold text-textGray rounded-small border-1 border-borderPrimary focus:outline-hoverBorderPrimary text-small' onChange={handleChange}>
            {options.map((option,index)=>(<option  key={index} value={option}>{option.charAt(0).toUpperCase()+option.slice(1)}</option>))}
            </select>
        )
    }
  return (
    <div className=' font-secondary flex gap-5 items-center'>
      <label for={id} className=' font-semibold text-primary'>{label}</label>
      {input}
    </div>
  )
}

export default MarketInput
