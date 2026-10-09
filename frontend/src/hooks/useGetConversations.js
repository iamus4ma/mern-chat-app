import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/userSlice";
import { apiRequest } from "../utils/apiRequest";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversationsData, setConversationsData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const getConversations = async () => {
      setLoading(true);

      try {
        const data = await apiRequest("/api/users", {
          signal: controller.signal,
          onUnauthorized: () => dispatch(logoutUser()),
        });
        setConversationsData(data);
      } catch (error) {
        if (error.name !== "AbortError" && error.status !== 401) toast.error(error.message);
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
