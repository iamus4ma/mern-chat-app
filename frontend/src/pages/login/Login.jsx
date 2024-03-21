import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import useLogin from "../../hooks/useLogin";

const Login = () => {
  const { control, handleSubmit } = useForm();
  const { loading, login } = useLogin();

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-900 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-15">
        <h1 className="text-3xl font-semibold text-center text-gray-300">
          Login
          <span className="text-indigo-800"> ChatKro</span>
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label p-2">
              <span className="text-base label-text ">Username*</span>
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
                  className="w-full input input-bordered h-10"
                />
              )}
            />
          </div>

          <div>
            <label className="label">
              <span className="text-base label-text">Password*</span>
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
                  className="w-full input input-bordered h-10"
                />
              )}
            />
          </div>

          <Link
            to="/signup"
            className="text-sm  hover:underline hover:text-blue-600 mt-2 inline-block"
          >
            {"Don't"} have an account?
          </Link>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-block btn-sm mt-2"
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
