import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/userSlice";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversationsData, setConversationsData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const getConversations = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/users", {
          method: "GET",
          signal: controller.signal,
        });
        const data = await res.json();

        if (res.status === 401) {
          dispatch(logoutUser());
          return;
        }

        if (data.error) {
          throw new Error(data.error);
        } else {
          setConversationsData(data);
        }
      } catch (error) {
        if (error.name !== "AbortError") toast.error(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    getConversations();
    return () => controller.abort();
  }, [dispatch]);

  return { loading, conversationsData };
};

export default useGetConversations;
