import React, { useEffect, useState } from 'react'
import CommentBlock from './CommentBlock'
import PostComment from './PostComment'

import { Button } from '../ui/button'
import { MdOutlineCommentsDisabled } from "react-icons/md";
import {
  Alert,
  AlertTitle
} from "@/components/ui/alert"

import useComment from '@/hooks/useComment'
const Comments = ({marketId}) => {
  const {comments,totalComments,fetchComments,nextCursor} = useComment(marketId)
  return (
    <div className="w-full mt-4 font-secondary">
      <div className=" py-2 border-b-1">
        <p className=" font-semibold text-primary ">
          Comments ({totalComments ? totalComments : "0"})
        </p>
      </div>
      <div className=" py-4">
        <PostComment marketId={marketId} />
      </div>
      {comments && comments.length > 0 ? (
        <div>
          <div className=" py-2">
            {comments.map((comment) => (
              <CommentBlock
                key={comment.id}
                username={comment.username}
                text={comment.text}
                createdAt={comment.createdAt}
                userProfileImg={comment.userProfileImg}
              />
            ))}
          </div>
          <div className="  flex justify-center md:justify-end">
              <Button
                size="sm"
                variant="ghost"
                disabled={nextCursor === null }
                onClick={() => {
                  fetchComments({ reset: false });
                }}
              >
                Load More Comments
              </Button> 
          </div>
        </div>
      ) : (
        <Alert className="max-w-md">
          <MdOutlineCommentsDisabled />
          <AlertTitle>No comments yet. Be the first to comment !</AlertTitle>
        </Alert>
      )}
    </div>
  );
}

export default Comments
