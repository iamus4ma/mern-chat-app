import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mergeMessages } from "../redux/features/conversationSlice";
import toast from "react-hot-toast";
import { logoutUser } from "../redux/features/userSlice";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );

  const dispatch = useDispatch();

  const sendmessage = async ({ message }) => {
    const success = handleInputErrors({
      message,
    });
    if (!success || !selectedConversation?._id || loading) return false;
    const conversationId = selectedConversation._id;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/messages/send/${conversationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
          }),
        }
      );
      const data = await res.json();

      if (res.status === 401) {
        dispatch(logoutUser());
        return false;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      } else {
        dispatch(mergeMessages({ conversationId, messages: [data] }));
        return true;
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { loading, sendmessage };
};

export default useSendMessage;

function handleInputErrors({ message }) {
  if (typeof message !== "string" || !message.trim()) {
    toast.error("Can't send empty message");
    return false;
  }

  return true;
}
