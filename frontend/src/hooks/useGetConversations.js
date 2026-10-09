import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/userSlice";
import { apiRequest } from "../utils/apiRequest";
import { useSocketContext } from "../context/SocketContext";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversationsData, setConversationsData] = useState([]);
  const dispatch = useDispatch();
  const { socket } = useSocketContext();
  const requestVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const getConversations = async () => {
      const version = ++requestVersion.current;
      setLoading(true);

      try {
        const data = await apiRequest("/api/conversations", { cache: "no-store" });
        if (active && version === requestVersion.current) setConversationsData(data);
      } catch (error) {
        if (active && version === requestVersion.current) {
          if (error.status === 401) dispatch(logoutUser());
          else toast.error(error.message);
        }
      } finally {
        if (active && version === requestVersion.current) setLoading(false);
      }
    };

    getConversations();
    socket?.on("conversationChanged", getConversations);
    return () => {
      active = false;
      requestVersion.current += 1;
      socket?.off("conversationChanged", getConversations);
    };
  }, [dispatch, socket]);

  return { loading, conversationsData };
};

export default useGetConversations;
