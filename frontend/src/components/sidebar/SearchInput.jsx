import { useRef, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { setSelectedConversation } from "../../redux/features/conversationSlice";
import { useDispatch } from "react-redux";
import { Blobatar } from "@blobatar/react";
import { apiRequest } from "../../utils/apiRequest";
import { logoutUser } from "../../redux/features/userSlice";

const SearchInput = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchVersion = useRef(0);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const version = ++searchVersion.current;
    try {
      const users = await apiRequest(`/api/users?q=${encodeURIComponent(query.trim())}`, {
        onUnauthorized: () => dispatch(logoutUser()),
      });
      if (version === searchVersion.current) {
        setResults(users);
        if (users.length === 0) setError("No users found.");
      }
    } catch (requestError) {
      if (version === searchVersion.current && requestError.status !== 401) setError(requestError.message);
    } finally {
      if (version === searchVersion.current) setLoading(false);
    }
  };

  return (
    <div>
      <form className="flex items-center gap-2" onSubmit={onSubmit}>
        <input type="search" value={query} onChange={(event) => {
          setQuery(event.target.value);
          setResults([]);
          setError("");
          searchVersion.current += 1;
          setLoading(false);
        }}
          placeholder="Find a person" aria-label="Find a person" className="rounded-full input min-w-0 w-full bg-slate-800 border-slate-500 text-white placeholder:text-slate-400" />
        <button type="submit" className="btn btn-circle bg-teal-700 hover:bg-teal-600 border-0 text-white shrink-0" disabled={loading} aria-label="Search users">
          {loading ? <span className="loading loading-spinner" /> : <IoSearchSharp className="w-6 h-6" />}
        </button>
      </form>
      {error && <p role="status" className="text-sm text-gray-200 mt-2">{error}</p>}
      {results.length > 0 && <div className="mt-2 max-h-40 overflow-auto rounded bg-gray-800">
        {results.map((user) => <button key={user._id} type="button"
          className="w-full flex items-center gap-2 p-2 text-left text-white hover:bg-teal-600"
          onClick={() => { dispatch(setSelectedConversation(user)); setResults([]); setQuery(""); }}>
          <Blobatar name={user.username || user._id} size={32} alt="" />
          <span className="truncate">{user.fullName}</span>
        </button>)}
      </div>}
    </div>
  );
};

export default SearchInput;
