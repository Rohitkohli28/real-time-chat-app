import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import Navbar from '../components/UI/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import VoiceButton from '../components/Voice/VoiceButton';
import VoiceCommandHandler from '../components/Voice/VoiceCommandHandler';
import ConnectionStatus from '../components/UI/ConnectionStatus';
import AmbientBackground from '../components/UI/AmbientBackground';

const ChatPage = () => {
  const { theme } = useContext(ChatContext);

  return (
    <div className={theme}>
      <div className={`h-screen w-screen flex flex-col relative overflow-hidden font-sans ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#081c34] via-[#0d264a] to-[#143460] text-slate-100' 
          : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900'
      }`}>
        {/* Animated Background Light circles */}
        <AmbientBackground />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full w-full max-w-[1920px] mx-auto p-2 sm:p-3 md:p-4 gap-3">
          <ConnectionStatus />
          <Navbar />
          <div className="flex flex-1 overflow-hidden gap-3 rounded-2xl relative">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 glass-panel shadow-2xl relative">
              <ChatWindow />
              <MessageInput />
            </main>
          </div>
        </div>

        <VoiceButton />
        <VoiceCommandHandler />
      </div>
    </div>
  );
};

export default ChatPage;
