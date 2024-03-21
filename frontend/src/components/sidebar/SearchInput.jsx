import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { IoSearchSharp } from "react-icons/io5";
import useGetConversations from "../../hooks/useGetConversations";
import { setSelectedConversation } from "../../redux/features/conversationSlice";
import { useDispatch } from "react-redux";

const SearchInput = () => {
  const dispatch = useDispatch();
  const { loading, conversationsData, error } = useGetConversations();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    if (!data.searchQuery) return;

    if (data.searchQuery.length < 3) {
      return toast.error("Search term must be at least 3 characters long");
    }

    const conversation = conversationsData.find((c) =>
      c.fullName.toLowerCase().includes(data.searchQuery.toLowerCase())
    );

    if (conversation) {
      dispatch(setSelectedConversation(conversation));
      reset();
    } else {
      toast.error("No such user found!");
    }
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="Search here . . ."
        className="rounded-full input input-bordered"
        {...register("searchQuery")}
      />
      <button type="submit" className="btn btn-circle bg-teal-500 text-white" disabled={loading}>
        {loading ? "Searching..." : <IoSearchSharp className="w-6 h-6 outline-none" />}
      </button>
      {error && <span className="text-red-500">{error.message}</span>}
    </form>
  );
};

export default SearchInput;
