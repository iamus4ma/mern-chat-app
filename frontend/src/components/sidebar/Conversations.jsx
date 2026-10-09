import SingleConversation from "./SingleConversation";

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
          lastIndex={index === conversationsData.length - 1}
        />
      ))}
    </div>
  );
};

export default Conversations;
