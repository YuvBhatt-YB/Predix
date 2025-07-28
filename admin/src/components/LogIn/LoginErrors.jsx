import React from 'react'

const LoginErrors = ({loginErrors}) => {
  return (
    <>
    {Object.keys(loginErrors).length > 0 && (<div className='mt-2 flex flex-col gap-1.5'>
      <div className="p-4 mb-4 text-sm  w-[440px] text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 " role="alert">
        {loginErrors.email && <p className="font-medium">{loginErrors.email}</p>}
        {loginErrors.password && <p className="font-medium ">{loginErrors.password}</p>}
      </div>
    </div>)}
    </>
  )
}

export default LoginErrors
