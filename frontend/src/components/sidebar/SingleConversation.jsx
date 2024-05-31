import { useDispatch, useSelector } from "react-redux";
import { setSelectedConversation } from "../../redux/features/conversationSlice";
import { useSocketContext } from "../../context/SocketContext";

const SingleConversation = ({ conversation, emoji, lastIndex }) => {
  const dispatch = useDispatch();
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const { onlineUsers } = useSocketContext();
	const isOnline = onlineUsers.includes(conversation._id);

  const isSelected = selectedConversation?._id === conversation._id;
  const handleClick = () => {
    dispatch(setSelectedConversation(conversation));
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-teal-500 rounded p-2 py-1 cursor-pointer ${
          isSelected ? "bg-teal-500" : ""
        }`}
        onClick={handleClick}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img src={conversation.profilePic} alt="user avatar" />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between">
            <p className="font-bold text-gray-200">{conversation.fullName}</p>
            <span className="text-xl">{emoji}</span>
          </div>
        </div>
      </div>
      {!lastIndex && <div className="divider my-0 py-0 h-1" />}
    </>
  );
};

export default SingleConversation;
