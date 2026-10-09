import { createContext, useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { logoutUser } from "../redux/features/userSlice";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const userId = useSelector((state) => state.user._id);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setSocket(null);
      setOnlineUsers([]);
      return;
    }

    const connection = io();
    connection.on("getOnlineUsers", setOnlineUsers);
    connection.on("connect_error", (error) => {
      if (error.message === "Unauthorized") dispatch(logoutUser());
    });
    connection.on("disconnect", (reason) => {
      if (reason === "io server disconnect") dispatch(logoutUser());
    });
    setSocket(connection);

    return () => {
      connection.disconnect();
      setOnlineUsers([]);
    };
  }, [isAuthenticated, userId, dispatch]);

  return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
