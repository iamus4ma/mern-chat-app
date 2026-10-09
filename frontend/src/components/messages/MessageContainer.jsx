import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { clearConversation } from "../../redux/features/conversationSlice";
import { useSocketContext } from "../../context/SocketContext";
import { apiRequest } from "../../utils/apiRequest";
import { logoutUser } from "../../redux/features/userSlice";
import { extractTime } from "../../utils/extractTime";

const MessageContainer = () => {
  const userFullname = useSelector((state) => state.user.fullName);
  const dispatch = useDispatch();
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [focusMessageId, setFocusMessageId] = useState(null);
  const searchVersion = useRef(0);
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );

  useEffect(() => {
    searchVersion.current += 1;
    //cleanup function
    return () => {
      dispatch(clearConversation());
    };
  }, [dispatch]);

  useEffect(() => {
    setIsTyping(false);
    setSearchOpen(false);
    setSearchResults([]);
    setFocusMessageId(null);
    if (!socket || !selectedConversation?._id) return;
    let timer;
    const onTyping = ({ senderId, isTyping: typing }) => {
      if (senderId !== selectedConversation._id) return;
      setIsTyping(typing);
      clearTimeout(timer);
      if (typing) timer = setTimeout(() => setIsTyping(false), 3000);
    };
    socket.on("typing", onTyping);
    return () => { clearTimeout(timer); socket.off("typing", onTyping); };
  }, [socket, selectedConversation?._id]);

  const searchMessages = async (event) => {
    event.preventDefault();
    if (searchQuery.trim().length < 2) {
      setSearchError("Enter at least 2 characters.");
      return;
    }
    setSearchLoading(true);
    setSearchError("");
    const version = ++searchVersion.current;
    try {
      const results = await apiRequest(`/api/messages/${selectedConversation._id}/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        onUnauthorized: () => dispatch(logoutUser()),
      });
      if (version === searchVersion.current) {
        setSearchResults(results);
        if (!results.length) setSearchError("No matching messages.");
      }
    } catch (error) {
      if (version === searchVersion.current && error.status !== 401) setSearchError(error.message);
    } finally {
      if (version === searchVersion.current) setSearchLoading(false);
    }
  };

  return (
    <div className={`${selectedConversation ? "flex" : "hidden sm:flex"} min-w-0 flex-1 flex-col min-h-0`}>
      {!selectedConversation ? (
        <NoChatSelected userFullname={userFullname} />
      ) : (
        <>
          {/* HEADER */}
          <div className="bg-slate-800 px-4 py-2 mb-2 flex items-center gap-3">
            <button type="button" className="sm:hidden text-white" onClick={() => dispatch(clearConversation())} aria-label="Back to chats">←</button>
            <span className="text-white font-bold truncate flex-1">{selectedConversation.fullName}</span>
            {focusMessageId && <button type="button" className="text-white text-sm underline" onClick={() => setFocusMessageId(null)}>Latest</button>}
            <button type="button" className="text-white text-sm underline" onClick={() => setSearchOpen((value) => !value)}>{searchOpen ? "Close search" : "Search"}</button>
          </div>
          {searchOpen ? <div className="px-4 pb-2 text-white flex-1 min-h-0 flex flex-col">
            <form onSubmit={searchMessages} className="flex gap-2">
              <input type="search" value={searchQuery} onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchResults([]);
                setSearchError("");
                searchVersion.current += 1;
                setSearchLoading(false);
              }}
                placeholder="Search messages" aria-label="Search messages" className="input input-sm flex-1 min-w-0 bg-slate-800 border-slate-500 text-white placeholder:text-slate-400" />
              <button type="submit" disabled={searchLoading} className="btn btn-sm bg-teal-700 hover:bg-teal-600 border-0 text-white">Search</button>
            </form>
            {searchError && <p role="status" className="text-sm mt-2">{searchError}</p>}
            {searchResults.length > 0 && <div className="flex-1 min-h-0 overflow-auto mt-3 bg-gray-800 rounded">
              {searchResults.map((message) => <button key={message._id} type="button" className="block w-full text-left p-2 hover:bg-slate-700"
                onClick={() => { setFocusMessageId(message._id); setSearchOpen(false); }}>
                <span className="text-xs text-gray-300">{extractTime(message.createdAt)}</span>
                <span className="block truncate text-sm">{message.message}</span>
              </button>)}
            </div>}
            {searchResults.length === 30 && <p className="text-xs mt-1">Showing 30 most recent matches.</p>}
          </div> : <>
            <Messages key={selectedConversation._id} focusMessageId={focusMessageId} />
            {isTyping && <p className="px-4 text-xs text-gray-200">{selectedConversation.fullName} is typing...</p>}
            <MessageInput key={selectedConversation._id} />
          </>}
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
