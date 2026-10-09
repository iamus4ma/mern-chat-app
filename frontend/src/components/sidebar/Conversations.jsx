import React from "react";
import SingleConversation from "./SingleConversation";
import { getRandomEmoji } from "../../utils/emojis";

const Conversations = ({ loading, conversationsData }) => {
  if (loading) {
    return <span className="loading loading-spinner mx-auto"></span>;
  }
  return (
    <div className="py-2 flex flex-col overflow-auto">
      {conversationsData?.map((conversation, index) => (
        <SingleConversation
          key={conversation._id}
          conversation={conversation}
          emoji={getRandomEmoji()}
          lastIndex={index === conversationsData.length - 1}
        />
      ))}
    </div>
  );
};

export default Conversations;
