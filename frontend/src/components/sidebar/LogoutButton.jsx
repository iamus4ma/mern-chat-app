import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
  const { loading, logout } = useLogout();
  return (
    <div className="mt-auto">
      {!loading ? (
        <button type="button" onClick={logout} aria-label="Log out" className="p-2 -m-2 text-slate-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400">
          <BiLogOut className="w-6 h-6" />
        </button>
      ) : (
        <span className="loading loading-spinner"></span>
      )}
    </div>
  );
};

export default LogoutButton;
