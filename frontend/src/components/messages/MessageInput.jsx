import { BsSend } from "react-icons/bs";
import { useForm } from "react-hook-form";
import useSendMessage from "../../hooks/useSendMessage";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocketContext } from "../../context/SocketContext";

const MessageInput = () => {
  const { register, handleSubmit, reset } = useForm();
  const { loading, error, sendmessage } = useSendMessage();
  const { socket } = useSocketContext();
  const conversationId = useSelector((state) => state.conversation.selectedConversation?._id);
  const typing = useRef({ active: false, lastSent: 0, timer: null });
  const stopTyping = () => {
    clearTimeout(typing.current.timer);
    if (typing.current.active && socket && conversationId) socket.emit("typing", { receiverId: conversationId, isTyping: false });
    typing.current.active = false;
  };
  useEffect(() => () => {
    clearTimeout(typing.current.timer);
    if (typing.current.active && socket && conversationId) socket.emit("typing", { receiverId: conversationId, isTyping: false });
  }, [socket, conversationId]);
  const onTyping = (event) => {
    if (!socket || !conversationId) return;
    if (!event.target.value.trim()) {
      stopTyping();
      return;
    }
    const now = Date.now();
    if (!typing.current.active || now - typing.current.lastSent > 1500) {
      socket.emit("typing", { receiverId: conversationId, isTyping: true });
      typing.current.lastSent = now;
      typing.current.active = true;
    }
    clearTimeout(typing.current.timer);
    typing.current.timer = setTimeout(stopTyping, 1200);
  };
  const onSubmit = async (data) => {
    if (!data) return;
    if (await sendmessage(data)) { reset(); stopTyping(); }
  };

  return (
    <form className="px-4 my-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full relative">
        <input
          type="text"
          maxLength={5000}
          placeholder="Send a message"
          className="w-full border border-slate-500 text-sm rounded-lg block p-2.5 pr-12 bg-slate-800 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          {...register("message", { onChange: onTyping })}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-100 hover:text-teal-300 disabled:opacity-50"
        >
          {loading ? (
            <div className="loading loading-spinner"></div>
          ) : (
            <BsSend />
          )}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </form>
  );
};

export default MessageInput;
