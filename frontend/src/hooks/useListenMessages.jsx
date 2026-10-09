import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { mergeMessages } from "../redux/features/conversationSlice";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const dispatch = useDispatch();
  const conversationId = useSelector((state) => state.conversation.selectedConversation?._id);
  useEffect(() => {
    if (!socket || !conversationId) return;
    const onMessage = (newMessage) => {
      if (newMessage.senderId !== conversationId) return;
      dispatch(mergeMessages({ conversationId, messages: [{ ...newMessage, shouldShake: true }] }));
      new Audio(notificationSound).play().catch(() => {});
    };
    socket.on("newMessage", onMessage);
    return () => socket.off("newMessage", onMessage);
  }, [socket, dispatch, conversationId]);
};

export default useListenMessages;
