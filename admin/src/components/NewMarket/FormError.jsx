import React from 'react'

const FormError = ({errorValues}) => {
  return (
    <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-2 font-secondary" role="alert" >
        <p class="font-bold text-small">Error</p>
        {Object.values(errorValues).map((error,index)=><p className=' text-xs mt-1' key={index}>{error}</p>)}
    </div>
  )
}

export default FormError
