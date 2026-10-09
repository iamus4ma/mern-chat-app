import React from "react";
import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import useGetConversations from "../../hooks/useGetConversations";

const Sidebar = () => {
  const { loading, conversationsData } = useGetConversations();
  return (
    <div className="border-r border-slate-600 p-4 flex flex-col">
      <SearchInput loading={loading} conversationsData={conversationsData} />
      <div className="divider px-3"></div>

      <Conversations loading={loading} conversationsData={conversationsData} />
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
