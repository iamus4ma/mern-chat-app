import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { replaceMessagePage, setMessagePage } from "../redux/features/conversationSlice";
import { logoutUser } from "../redux/features/userSlice";
import { apiRequest } from "../utils/apiRequest";

const pendingPages = new Map();

const getPage = (path) => {
  if (!pendingPages.has(path)) {
    const request = apiRequest(path, { cache: "no-store" }).finally(() => pendingPages.delete(path));
    pendingPages.set(path, request);
  }
  return pendingPages.get(path);
};

const useGetMessages = (focusMessageId) => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const previousFocus = useRef(null);
  const dispatch = useDispatch();
  const conversationId = useSelector((state) => state.conversation.selectedConversation?._id);
  const messages = useSelector((state) => state.conversation.messages);
  const hasMore = useSelector((state) => state.conversation.hasMore);
  const nextCursor = useSelector((state) => state.conversation.nextCursor);

  useEffect(() => {
    if (!conversationId) return;
    let active = true;
    const replace = Boolean(focusMessageId || previousFocus.current);
    previousFocus.current = focusMessageId;
    const getMessages = async () => {
      setLoading(true);

      try {
        const query = focusMessageId ? `?around=${focusMessageId}` : "";
        const data = await getPage(`/api/messages/${conversationId}${query}`);
        if (active) dispatch((replace ? replaceMessagePage : setMessagePage)({ conversationId, ...data }));
      } catch (error) {
        if (active) {
          if (error.status === 401) dispatch(logoutUser());
          else toast.error(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    getMessages();
    return () => { active = false; };
  }, [conversationId, focusMessageId, dispatch]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await getPage(`/api/messages/${conversationId}?before=${nextCursor}`);
      dispatch(setMessagePage({ conversationId, ...data }));
      return true;
    } catch (error) {
      if (error.status === 401) dispatch(logoutUser());
      else toast.error(error.message);
      return false;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [conversationId, nextCursor, dispatch]);

  return { loading, loadingMore, messages, hasMore, loadMore };
};

export default useGetMessages;
