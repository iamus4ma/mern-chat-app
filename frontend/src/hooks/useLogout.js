import { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/features/userSlice";
import toast from "react-hot-toast";
import { apiRequest } from "../utils/apiRequest";

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const logout = async () => {
    setLoading(true);

    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      dispatch(logoutUser());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { loading, logout };
};

export default useLogout;
