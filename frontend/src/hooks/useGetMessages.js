import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { mergeMessages } from "../redux/features/conversationSlice";
import { logoutUser } from "../redux/features/userSlice";
import { apiRequest } from "../utils/apiRequest";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const conversationId = useSelector((state) => state.conversation.selectedConversation?._id);
  const messages = useSelector((state) => state.conversation.messages);

  useEffect(() => {
    if (!conversationId) return;
    const controller = new AbortController();
    const getMessages = async () => {
      setLoading(true);

      try {
        const data = await apiRequest(`/api/messages/${conversationId}`, {
          signal: controller.signal,
          onUnauthorized: () => dispatch(logoutUser()),
        });
        dispatch(mergeMessages({ conversationId, messages: data }));
      } catch (error) {
        if (error.name !== "AbortError" && error.status !== 401) toast.error(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    getMessages();
    return () => controller.abort();
  }, [conversationId, dispatch]);

  return { loading, messages };
};

export default useGetMessages;
