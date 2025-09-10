import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
const AddFunds = () => {
  return (
    <div className="flex flex-col md:flex-row w-full md:max-w-lg items-center gap-2 font-secondary mt-8">
      <Input
        type="text"
        placeholder="Enter Your Amount"
        className="rounded-small   text-primary focus:outline-none focus:ring-0 focus:border-none "
      />
      <Button
        type="submit"
        className="max-md:w-full rounded-small bg-primaryBlue hover:bg-secondaryBlue"
      >
        Deposit Amount
      </Button>
    </div>
  );
}

export default AddFunds
