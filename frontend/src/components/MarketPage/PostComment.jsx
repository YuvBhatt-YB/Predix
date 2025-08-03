import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
const PostComment = () => {
  return (
    <div className="flex w-full  items-center gap-2">
      <Input type="text" placeholder="Comment" />
      <Button type="submit" size="lg" className="bg-primaryBlue hover:bg-secondaryBlue" >
        Post
      </Button>
    </div>
  )
}

export default PostComment
