import { useSelector } from "react-redux";
import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import useGetConversations from "../../hooks/useGetConversations";

const Sidebar = () => {
  const { loading, conversationsData } = useGetConversations();
  const selectedConversation = useSelector((state) => state.conversation.selectedConversation);
  return (
    <div className={`${selectedConversation ? "hidden sm:flex" : "flex"} w-full sm:w-80 shrink-0 border-r border-slate-600 p-4 flex-col min-h-0`}>
      <h2 className="text-lg font-semibold text-white mb-3">Chats</h2>
      <SearchInput />
      <div className="divider px-3"></div>

      <Conversations loading={loading} conversationsData={conversationsData} />
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
