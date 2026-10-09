import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { finishAuthCheck, setUser } from "./redux/features/userSlice";

function App() {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const authChecked = useSelector((state) => state.user.authChecked);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => {
        if (user) dispatch(setUser(user));
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Session check failed", error);
      })
      .finally(() => {
        if (!controller.signal.aborted) dispatch(finishAuthCheck());
      });
    return () => controller.abort();
  }, [dispatch]);

  if (!authChecked) return <div className="loading loading-spinner" />;

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
