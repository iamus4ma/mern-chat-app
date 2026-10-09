import React from "react";
import { useForm, Controller } from "react-hook-form";
import GenderCheckbox from "./GenderCheckbox";
import { Link } from "react-router-dom";
import useSignup from "../../hooks/useSignup";

const SignUp = () => {
  const { loading, signup } = useSignup();
  const { control, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    await signup(data);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto px-4">
      <div className="w-full p-6 rounded-lg shadow-md bg-slate-900/55 backdrop-blur-lg">
        <h1 className="text-3xl font-semibold text-center text-white">
          Sign Up
          <span className="text-teal-300"> ChatKro</span>
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label p-2">
              <span className="text-base text-slate-100">Fullname*</span>
            </label>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter fullname here . . ."
                  className="w-full input h-10 bg-slate-800 border-slate-500 text-white placeholder:text-slate-400"
                />
              )}
            />
          </div>

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
                  placeholder="Enter password here . . ."
                  className="w-full input h-10 bg-slate-800 border-slate-500 text-white placeholder:text-slate-400"
                />
              )}
            />
          </div>
          <div>
            <label className="label">
              <span className="text-base text-slate-100">Confirm Password*</span>
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Enter password again here . . ."
                  className="w-full input h-10 bg-slate-800 border-slate-500 text-white placeholder:text-slate-400"
                />
              )}
            />
          </div>
          <GenderCheckbox control={control} />

          <Link
            to="/login"
            className="text-sm text-teal-200 hover:underline hover:text-teal-100 mt-2 inline-block"
          >
            Already have an account?
          </Link>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-block btn-sm mt-2 bg-teal-700 hover:bg-teal-600 border-0 text-white"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Sign up"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
