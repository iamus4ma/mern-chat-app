import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { markMessagesRead, mergeMessages, updateMessage } from "../redux/features/conversationSlice";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const dispatch = useDispatch();
  const conversationId = useSelector((state) => state.conversation.selectedConversation?._id);
  const userId = useSelector((state) => state.user._id);
  useEffect(() => {
    if (!socket || !conversationId) return;
    const onMessage = (newMessage) => {
      if (newMessage.senderId !== conversationId && newMessage.receiverId !== conversationId) return;
      const incoming = newMessage.senderId === conversationId;
      dispatch(mergeMessages({ conversationId, messages: [{ ...newMessage, shouldShake: incoming }] }));
      if (incoming) new Audio(notificationSound).play().catch(() => {});
    };
    const onUpdated = (message) => dispatch(updateMessage(message));
    const onRead = ({ readerId, readAt }) => dispatch(markMessagesRead({
      peerId: readerId, senderId: userId, readAt,
    }));
    socket.on("newMessage", onMessage);
    socket.on("messageUpdated", onUpdated);
    socket.on("messagesRead", onRead);
    return () => {
      socket.off("newMessage", onMessage);
      socket.off("messageUpdated", onUpdated);
      socket.off("messagesRead", onRead);
    };
  }, [socket, dispatch, conversationId, userId]);
};

export default useListenMessages;
