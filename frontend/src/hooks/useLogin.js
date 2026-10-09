import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const login = async ({ username, password }) => {
    setError("");
    if (typeof username !== "string" || !username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.error || "Unable to sign in. Please try again.");
      if (!data?._id) throw new Error("Unable to sign in. Please try again.");
      dispatch(setUser(data));
    } catch (error) {
      setError(error instanceof TypeError ? "Cannot reach the server. Please try again." : error.message);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, login };
};

export default useLogin;
