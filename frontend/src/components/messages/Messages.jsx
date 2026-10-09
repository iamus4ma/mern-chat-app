import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import { apiRequest } from "../../utils/apiRequest";
import { logoutUser } from "../../redux/features/userSlice";
import { markMessagesRead } from "../../redux/features/conversationSlice";

const Messages = ({ focusMessageId }) => {
  const { loading, loadingMore, messages, hasMore, loadMore } = useGetMessages(focusMessageId);
  useListenMessages();
  const dispatch = useDispatch();
  const conversationId = useSelector((state) => state.conversation.selectedConversation?._id);
  const containerRef = useRef(null);
  const restoreHeight = useRef(null);
  const stickToBottom = useRef(true);
  const lastFocused = useRef(null);
  const readInFlight = useRef(false);

  useEffect(() => {
    if (!focusMessageId) {
      stickToBottom.current = true;
      lastFocused.current = null;
    }
  }, [focusMessageId]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;
    if (restoreHeight.current !== null && !loadingMore) {
      container.scrollTop += container.scrollHeight - restoreHeight.current;
      restoreHeight.current = null;
    } else if (focusMessageId && focusMessageId !== lastFocused.current) {
      const target = container.querySelector(`[data-message-id="${focusMessageId}"]`);
      if (target) {
        target.scrollIntoView({ block: "center" });
        lastFocused.current = focusMessageId;
        stickToBottom.current = false;
      }
    } else if (stickToBottom.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading, loadingMore, focusMessageId]);

  useEffect(() => {
    if (!conversationId || focusMessageId) return;
    const markRead = async () => {
      if (readInFlight.current || document.visibilityState !== "visible" ||
          !messages.some((message) => String(message.senderId) === conversationId && !message.readAt)) return;
      readInFlight.current = true;
      try {
        const { readAt } = await apiRequest(`/api/conversations/${conversationId}/read`, {
          method: "PATCH", onUnauthorized: () => dispatch(logoutUser()),
        });
        dispatch(markMessagesRead({ peerId: conversationId, senderId: conversationId, readAt }));
      } catch (error) {
        if (error.status !== 401) console.error("Could not mark messages read", error);
      } finally {
        readInFlight.current = false;
      }
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [conversationId, focusMessageId, messages, dispatch]);

  const onLoadMore = async () => {
    restoreHeight.current = containerRef.current?.scrollHeight ?? null;
    if (!(await loadMore())) restoreHeight.current = null;
  };

  return (
    <div ref={containerRef} onScroll={(event) => {
      const node = event.currentTarget;
      stickToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
    }} className="px-4 flex-1 min-h-0 overflow-auto">
      {hasMore && <button type="button" className="btn btn-ghost btn-sm text-white block mx-auto mb-3" onClick={onLoadMore} disabled={loadingMore}>
        {loadingMore ? "Loading..." : "Load older messages"}
      </button>}
      {!loading &&
        messages.map((message) => (
          <div key={message._id} data-message-id={message._id} className={focusMessageId === message._id ? "rounded bg-teal-500/20" : ""}>
            <Message message={message} />
          </div>
        ))}

      {loading &&
        [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {!loading && messages.length === 0 && (
        <p className="text-center text-slate-300">
          Send a message to start the conversation
        </p>
      )}
    </div>
  );
};

export default Messages;
