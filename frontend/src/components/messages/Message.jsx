import { useSelector } from "react-redux";
import { extractTime } from "../../utils/extractTime";
import { Blobatar } from "@blobatar/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { apiRequest } from "../../utils/apiRequest";
import { updateMessage } from "../../redux/features/conversationSlice";
import { logoutUser } from "../../redux/features/userSlice";

const Message = ({ message }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.message);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const userMe = useSelector((state) => state.user);
  const selectedConversation = useSelector(
    (state) => state?.conversation?.selectedConversation
  );

  const fromMe = message.senderId === userMe?._id;

  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";

  const avatarUser = fromMe ? userMe : selectedConversation;
  const bubbleBgColor = fromMe ? "bg-teal-700" : "bg-slate-700";

  const shakeClass = message.shouldShake ? "shake" : "";
  const saveEdit = async () => {
    if (!draft.trim() || draft.length > 5000 || busy) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiRequest(`/api/messages/${message._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft }),
        onUnauthorized: () => dispatch(logoutUser()),
      });
      dispatch(updateMessage(updated));
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  const deleteMessage = async () => {
    if (busy || !window.confirm("Delete this message for everyone?")) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiRequest(`/api/messages/${message._id}`, {
        method: "DELETE", onUnauthorized: () => dispatch(logoutUser()),
      });
      dispatch(updateMessage(updated));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <Blobatar name={avatarUser?.username || avatarUser?._id || "user"} size={40} alt={`${avatarUser?.fullName || "User"} avatar`} />
        </div>
      </div>
      <div
        className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2`}
      >
        {editing ? <div className="flex flex-col gap-2">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={5000} className="input input-sm bg-slate-900 text-white placeholder:text-slate-400 border-slate-500" aria-label="Edit message" />
          <div className="flex gap-2">
            <button type="button" onClick={saveEdit} disabled={busy || !draft.trim()} className="btn btn-xs bg-slate-900 text-white border-slate-500 hover:bg-slate-800">Save</button>
            <button type="button" onClick={() => { setEditing(false); setError(""); }} className="btn btn-xs btn-ghost text-white">Cancel</button>
          </div>
        </div> : <span className={message.deletedAt ? "italic opacity-75" : ""}>{message.deletedAt ? "Message deleted" : message.message}</span>}
      </div>
      <div className="chat-footer text-slate-300 text-xs flex gap-1 items-center">
        {formattedTime}
        {message.editedAt && !message.deletedAt && <span>· edited</span>}
        {fromMe && !message.deletedAt && <span>· {message.readAt ? "Read" : "Sent"}</span>}
        {fromMe && !message.deletedAt && !editing && <>
          <button type="button" onClick={() => { setDraft(message.message); setEditing(true); }} className="underline">Edit</button>
          <button type="button" onClick={deleteMessage} disabled={busy} className="underline">Delete</button>
        </>}
      </div>
      {error && <span role="alert" className="text-xs text-red-300">{error}</span>}
    </div>
  );
};

export default Message;
