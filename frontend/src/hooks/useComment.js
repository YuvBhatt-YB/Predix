import { io } from 'socket.io-client'
import { commentSocketRoute } from '@/socket/comment'
import api from "../api/comment"
import { useEffect, useState } from 'react';

export default function useComment(marketId) {
  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalComments, setTotalComments] = useState(0);
  const fetchComments = async (options) => {
    const { reset = false } = options;
    if (!reset && nextCursor === null) return;
    try {
      console.log(reset);
      const query = new URLSearchParams();
      query.append("marketId", marketId);
      query.append("take", "10");
      if (nextCursor !== null && !reset) query.append("cursor", nextCursor);
      const response = await api.get(`/?${query.toString()}`);
      console.log(response);
      if (reset) {
        setComments(response.data.comments);
      } else {
        setComments((prevState) => [...prevState, ...response.data.comments]);
      }
      setNextCursor(response.data.nextCursor);
      setTotalComments(response.data.totalCount);
      setIsEndReached(response.data.nextCursor === null);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    console.log(commentSocketRoute);
    const socket = io(commentSocketRoute);
    const init = async () => {
      await fetchComments({ reset: true });
      socket.emit("joinMarket", marketId);
      socket.on("newComment", (comment) => {
        console.log(comment);
        setComments((prevState) => [comment, ...prevState]);
        setTotalComments((prev) => prev + 1);
        setIsEndReached(false);
      });
    };
    init();
    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    comments,
    totalComments,
    fetchComments,
    nextCursor
  }
}