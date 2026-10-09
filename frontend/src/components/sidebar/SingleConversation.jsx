import { useDispatch, useSelector } from "react-redux";
import { setSelectedConversation } from "../../redux/features/conversationSlice";
import { useSocketContext } from "../../context/SocketContext";
import { Blobatar } from "@blobatar/react";
import { extractTime } from "../../utils/extractTime";

const SingleConversation = ({ conversation, lastIndex }) => {
  const dispatch = useDispatch();
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );
  const { onlineUsers } = useSocketContext();
	const isOnline = onlineUsers.includes(conversation._id);

  const isSelected = selectedConversation?._id === conversation._id;
  const handleClick = () => {
    dispatch(setSelectedConversation(conversation));
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-slate-700 rounded p-2 py-1 cursor-pointer ${
          isSelected ? "bg-teal-700 hover:bg-teal-700" : ""
        }`}
        onClick={handleClick}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <Blobatar name={conversation.username || conversation._id} size={48} alt={`${conversation.fullName} avatar`} />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <p className="font-bold text-gray-200 truncate">{conversation.fullName}</p>
            {conversation.updatedAt && <span className="text-xs text-gray-300 shrink-0">{extractTime(conversation.updatedAt)}</span>}
          </div>
          <div className="flex justify-between gap-2 items-center">
            <p className="text-xs text-gray-300 truncate">{conversation.lastMessage?.deletedAt ? "Message deleted" : conversation.lastMessage?.message || "Start chatting"}</p>
            {conversation.unreadCount > 0 && <span className={`badge badge-sm text-white border-0 ${isSelected ? "bg-slate-900" : "bg-teal-700"}`}>{conversation.unreadCount}</span>}
          </div>
        </div>
      </div>
      {!lastIndex && <div className="divider my-0 py-0 h-1" />}
    </>
  );
};

export default SingleConversation;
