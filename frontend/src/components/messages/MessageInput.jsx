import { BsSend } from "react-icons/bs";
import { useForm } from "react-hook-form";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
  const { register, handleSubmit, reset } = useForm();
  const { loading, error, sendmessage } = useSendMessage();
  const onSubmit = async (data) => {
    if (!data) return;
    if (await sendmessage(data)) reset();
  };

  return (
    <form className="px-4 my-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full relative">
        <input
          type="text"
          maxLength={5000}
          placeholder="Send a message"
          className="w-full border text-sm rounded-lg block p-2.5 bg-gray-600 text-white"
          {...register("message")}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute inset-y-0 end-0 flex items-center pe-3"
        >
          {loading ? (
            <div className="loading loading-spinner"></div>
          ) : (
            <BsSend />
          )}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </form>
  );
};

export default MessageInput;
