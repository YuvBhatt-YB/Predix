import React, { useState } from 'react'
import MarketInput from './MarketInput'
import AdditionalStats from './AdditionalStats'
import useForm from '../../hooks/useForm'
import FormError from './FormError'

const options =["sports","politics","football","cricket","crypto","forex","stocks","esports","world","tennis"]
const MarketForm = () => {

 const {formValues,handleChange,formErrors,handleSubmit} = useForm()

  return (
    <div>
      <div className='  flex flex-col gap-5 pb-8 border-b-1 border-borderPrimary'>
        <div className=' flex justify-between items-center'>
            <MarketInput name="title" id="title" placeholder="Enter Your Title" type="text" label="Title" handleChange={handleChange} value={formValues.title} />
            <MarketInput name='category' id="category" label="Category" type="options" options={options} handleChange={handleChange} value={formValues.category}/>
        </div>
        <div className=' flex justify-between items-center'>
            <MarketInput name="image" id="image" placeholder="Enter Image Link" type="text" label="Image" handleChange={handleChange} value={formValues.image} />
            <MarketInput name="endTime" id="endTime" type="datetime" label="End Time" handleChange={handleChange} value={formValues.endTime} />
        </div>
        <div>
            <MarketInput name="description" id="description" placeholder="Enter Your Description" type="text" label="Description" handleChange={handleChange} value={formValues.description} />
        </div>
        {Object.keys(formErrors).length > 0 ? <FormError errorValues={formErrors} />:""}
      </div>
      <div className='flex justify-between mt-4 items-start'>
        <AdditionalStats formValues={formValues} />
        <button className="px-6 py-2 font-secondary bg-primaryBlue text-small text-white rounded-small font-semibold cursor-pointer hover:bg-secondaryBlue" onClick={handleSubmit}>Add Market</button>
      </div>
    </div>
  )
}

export default MarketForm
