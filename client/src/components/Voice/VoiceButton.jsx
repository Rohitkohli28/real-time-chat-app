import { useContext } from 'react';
import { useVoice } from '../../hooks/useVoice';
import { ChatContext } from '../../context/ChatContext';

const VoiceButton = () => {
  const { isListening, transcript, supported, toggleListening } = useVoice();
  const { theme } = useContext(ChatContext);
  const isDark = theme === 'dark';

  if (!supported) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {/* Transcript display */}
      {isListening && transcript && (
        <div className={`max-w-[300px] px-4 py-3 rounded-2xl shadow-xl animate-fade-in ${
          isDark
            ? 'bg-dark-sidebar border border-white/10 text-white'
            : 'bg-white border border-gray-200 text-gray-800 shadow-lg'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className={`text-xs font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              Listening...
            </span>
          </div>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {/* Mic button */}
      <button
        id="voice-btn"
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 ${
          isListening
            ? 'bg-red-500 text-white mic-pulse'
            : isDark
              ? 'gradient-accent text-white'
              : 'bg-light-accent text-white'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        {isListening ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceButton;
