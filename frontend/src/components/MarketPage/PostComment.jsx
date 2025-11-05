import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSelector } from 'react-redux'
import api from "../../api/comment"

const PostComment = ({marketId}) => {
  const [comment,setComment] = useState("")
  const [error,setError] = useState("")
  const [isPosting,setIsPosting] = useState(false)
  const user = useSelector((state) => state.user.userData)
  const handleSetComment = (e) => {
    setError("")
    setComment(e.target.value)
  }
  const handleSubmitComment = async() => {
    const data = {
      marketId:marketId,
      username:user.username,
      userProfileImg:user.profileImg,
      text:comment
    }
    try {
      setIsPosting(true)
      const response = await api.post('/',data)
      console.log(response)
      setComment("")
      setError("")
    } catch (error) {
      setError(error.response.data.message || "Something went wrong")
    } finally {
      setIsPosting(false)
    }

  }
  return (
    <>
      <div className="flex w-full  items-center gap-2">
        <Input value={comment} type="text" placeholder="Comment" onChange={handleSetComment} />
        <Button
          type="submit"
          size="lg"
          className="bg-primaryBlue hover:bg-secondaryBlue"
          onClick={handleSubmitComment}
          disabled ={isPosting}
        >
          {isPosting ? "Posting" : "Post"}
        </Button>
      </div>
      <div>
        {error && <p className=' py-1 text-darkRed text-small font-semibold'>{error}</p>}
      </div>
    </>
  );
}

export default PostComment
