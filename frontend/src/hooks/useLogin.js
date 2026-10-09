import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import { apiRequest } from "../utils/apiRequest";

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
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (!data?._id) throw new Error("Unable to sign in. Please try again.");
      dispatch(setUser(data));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, login };
};

export default useLogin;
