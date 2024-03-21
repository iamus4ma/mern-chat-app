import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/features/conversationSlice";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );
  const messages = useSelector((state) => state.conversation.messages);

  const dispatch = useDispatch();

  const sendmessage = async ({ message }) => {
    const success = handleInputErrors({
      message,
    });
    if (!success) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/messages/send/${selectedConversation?._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
          }),
        }
      );
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      } else {
        console.log(data);
        // dispatch(setUser(data));
        dispatch(setMessages([...messages, data]));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { loading, sendmessage };
};

export default useSendMessage;

function handleInputErrors({ message }) {
  if (!message) {
    toast.error("Can't send empty message");
    return false;
  }

  return true;
}
