import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversationsData, setConversationsData] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/users", {
          method: "GET",
        });
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        } else {
          setConversationsData(data);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return { loading, conversationsData };
};

export default useGetConversations;
