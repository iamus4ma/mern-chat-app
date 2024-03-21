import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { clearConversation } from "../../redux/features/conversationSlice";

const MessageContainer = () => {
  const userFullname = useSelector((state) => state.user.fullName);
  const dispatch = useDispatch();
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );

  useEffect(() => {
    //cleanup function
    return () => {
      dispatch(clearConversation());
    };
  }, [clearConversation]);

  return (
    <div className="md:min-w-[450px] flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected userFullname={userFullname} />
      ) : (
        <>
          {/* HEADER */}
          <div className="bg-slate-600 px-4 py-2 mb-2">
            <span className="label-text">To:</span>
            <span className="text-gray-900 font-bold">
              {" "}
              {selectedConversation.fullName}
            </span>
          </div>
          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = ({ userFullname }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <p>Welcome 👋 {userFullname ? userFullname : "Unknown"} ❄</p>
        <p>Select a chat to start messaging</p>
        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};
