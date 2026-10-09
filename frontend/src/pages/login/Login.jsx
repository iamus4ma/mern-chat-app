import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import useLogin from "../../hooks/useLogin";

const Login = () => {
  const { control, handleSubmit } = useForm();
  const { loading, error, login } = useLogin();

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto px-4">
      <div className="w-full p-6 rounded-lg shadow-md bg-slate-900/55 backdrop-blur-lg">
        <img src="/chatkro.svg" alt="ChatKro" className="w-14 h-14 mx-auto mb-3" />
        <h1 className="text-3xl font-semibold text-center text-white">
          Login
          <span className="text-teal-300"> ChatKro</span>
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label p-2">
              <span className="text-base text-slate-100">Username*</span>
            </label>
            <Controller
              name="username"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter username here . . ."
                  className="w-full input h-10 bg-slate-800 border-slate-500 text-white placeholder:text-slate-400"
                />
              )}
            />
          </div>

          <div>
            <label className="label">
              <span className="text-base text-slate-100">Password*</span>
            </label>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Enter Password here . . ."
                  className="w-full input h-10 bg-slate-800 border-slate-500 text-white placeholder:text-slate-400"
                />
              )}
            />
          </div>

          <Link
            to="/signup"
            className="text-sm text-teal-200 hover:underline hover:text-teal-100 mt-2 inline-block"
          >
            {"Don't"} have an account?
          </Link>

          {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-block btn-sm mt-2 bg-teal-700 hover:bg-teal-600 border-0 text-white"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
