import Sidebar from "../../components/sidebar/Sidebar";
import MessageContainer from "../../components/messages/MessageContainer";

const Home = () => {
  return (
    <div
      className="flex w-full max-w-5xl h-[100dvh] sm:h-[700px] sm:max-h-[90dvh] sm:rounded-lg overflow-hidden
      bg-slate-900/55 backdrop-blur-lg"
    >
      <Sidebar />
      <MessageContainer />
    </div>
  );
};

export default Home;
