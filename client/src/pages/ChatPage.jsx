import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import Navbar from '../components/UI/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import MessageInput from '../components/Chat/MessageInput';
import VoiceButton from '../components/Voice/VoiceButton';
import VoiceCommandHandler from '../components/Voice/VoiceCommandHandler';
import ConnectionStatus from '../components/UI/ConnectionStatus';

const ChatPage = () => {
  const { theme } = useContext(ChatContext);

  return (
    <div className={theme}>
      <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-dark-bg text-white' : 'bg-light-bg text-gray-800'}`}>
        <ConnectionStatus />
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <ChatWindow />
            <MessageInput />
          </main>
        </div>
        <VoiceButton />
        <VoiceCommandHandler />
      </div>
    </div>
  );
};

export default ChatPage;
