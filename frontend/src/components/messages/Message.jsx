const Message = () => {
  return (
    <div className="chat chat-end">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            src="https://avatar.iran.liara.run/public/boy"
            alt="user avatar"
          />
        </div>
      </div>
      <div className={`chat-bubble text-white bg-blue-500`}>
        Hi! What is upp?
      </div>
      <div className="chat-footer opacity-70 text-black text-xs flex gap-1 items-center">
        12:48
      </div>
    </div>
  );
};

export default Message;
