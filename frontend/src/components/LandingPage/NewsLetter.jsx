import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
const NewsLetter = () => {
  return (
    <div className='  bg-primaryBlue'>
      <div className='max-width mx-auto py-12 md:py-24 px-2 md:px-0'>
        <div className='  w-full flex flex-col items-center justify-center gap-4'>
            <div>
                <p className=' text-white font-main text-2xl md:text-4xl text-center'>Sign Up For Our Newsletter</p>
                <p className=' font-secondary text-white text-center'>Get latest updates from ourselves</p>
            </div>
            <div className="flex w-full max-w-sm items-center gap-2">
                <Input type="email" placeholder="Email" className="bg-white rounded-small focus:outline-none font-secondary " />
                <Button type="submit" variant="outline" className="rounded-small bg-secondaryBlue font-semibold font-secondary text-white border-none">
                    Subscribe
                </Button>
            </div>
            <div>

            </div>
            <div className=' border-t-1 w-full text-center border-borderGray'>
                <p className=' text-white font-secondary mt-2 text-esm md:text-[16px]'>"© 2025 Yuv Bhatt. All rights reserved."</p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default NewsLetter
