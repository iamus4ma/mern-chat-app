import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { logoutUser, setAuthUnavailable, setUser, startAuthCheck } from "./redux/features/userSlice";
import { apiRequest } from "./utils/apiRequest";

function App() {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const authStatus = useSelector((state) => state.user.authStatus);
  const [attempt, setAttempt] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    dispatch(startAuthCheck());
    apiRequest("/api/auth/me", { signal: controller.signal })
      .then((user) => dispatch(setUser(user)))
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (error.status === 401) dispatch(logoutUser());
        else dispatch(setAuthUnavailable());
      });
    return () => controller.abort();
  }, [dispatch, attempt]);

  if (authStatus === "checking") return <div className="loading loading-spinner" />;
  if (authStatus === "unavailable") return (
    <div role="alert" className="text-center text-white">
      <p>Cannot reach the server to check your session.</p>
      <button className="btn mt-3" onClick={() => setAttempt((value) => value + 1)}>Retry</button>
    </div>
  );

  return (
    <div className="p-4 h-screen flex items-center justify-center">
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <SignUp />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
