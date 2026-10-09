import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mergeMessages } from "../redux/features/conversationSlice";
import { logoutUser } from "../redux/features/userSlice";
import { apiRequest } from "../utils/apiRequest";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(null);
  const inFlight = useRef(false);
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );

  const dispatch = useDispatch();

  const sendmessage = async ({ message }) => {
    if (inFlight.current || !selectedConversation?._id) return false;
    setError("");
    if (typeof message !== "string" || !message.trim() || message.length > 5000) {
      setError("Enter a message of up to 5,000 characters.");
      return false;
    }
    const conversationId = selectedConversation._id;
    const text = message.trim();
    if (!pending.current || pending.current.conversationId !== conversationId || pending.current.message !== text) {
      pending.current = { conversationId, message: text, clientMessageId: crypto.randomUUID() };
    }
    inFlight.current = true;
    setLoading(true);

    try {
      const data = await apiRequest(
        `/api/messages/send/${conversationId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, clientMessageId: pending.current.clientMessageId }),
          onUnauthorized: () => dispatch(logoutUser()),
        }
      );
      pending.current = null;
      dispatch(mergeMessages({ conversationId, messages: [data] }));
      return true;
    } catch (error) {
      if (error.status === 401) return false;
      if (error.status > 0 && error.status < 500) pending.current = null;
      setError(error.status === 0 || error.status >= 500
        ? "Delivery is unconfirmed. Press send again to check."
        : error.message);
      return false;
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };
  return { loading, error, sendmessage };
};

export default useSendMessage;
