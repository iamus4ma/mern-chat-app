import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const [messagesData, setMessagesData] = useState([]);
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );

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
          setMessagesData(data);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessagesData]);

  return { loading, messagesData };
};

export default useGetMessages;
