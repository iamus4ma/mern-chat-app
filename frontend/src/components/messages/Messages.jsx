import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";

import Message from "./Message";

const Messages = () => {
  const { loading, messagesData } = useGetMessages();
  const lastMessageRef = useRef();

	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messagesData]);

  return (
    <div className="px-4 flex-1 overflow-auto">
      {!loading &&
        messagesData.length > 0 &&
        messagesData.map((message) => (
          <div key={message._id}  ref={lastMessageRef} >
            <Message message={message} />
          </div>
        ))}

      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
      {!loading && messagesData.length === 0 && (
        <p className="text-center opacity-50 text-black">Send a message to start the conversation</p>
      )}
    </div>
  );
};

export default Messages;
