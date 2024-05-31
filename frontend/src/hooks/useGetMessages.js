import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/features/conversationSlice";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );
  const messages = useSelector((state) => state.conversation.messages);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/messages/${selectedConversation?._id}`, {
          method: "GET",
        });
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        } else {
      dispatch(setMessages(data))
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessages]);

  return { loading, messages };
};

export default useGetMessages;
