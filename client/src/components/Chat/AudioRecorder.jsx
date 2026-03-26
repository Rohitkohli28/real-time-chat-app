import { useState, useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

const AudioRecorder = ({ activeRoom }) => {
  const { theme } = useContext(ChatContext);
  const { socket } = useSocket();
  const {
    isRecording,
    audioUrl,
    duration,
    permissionError,
    startRecording,
    stopRecording,
    cancelRecording,
    getBase64Audio,
    clearRecording,
    MAX_DURATION,
  } = useAudioRecorder();
  const [sending, setSending] = useState(false);
  const isDark = theme === 'dark';

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!socket || !activeRoom) return;
    setSending(true);
    try {
      const audioData = await getBase64Audio();
      socket.emit('send_voice_message', {
        audioData,
        roomId: activeRoom._id,
      });
      clearRecording();
    } catch (err) {
      console.error('Failed to send voice message:', err);
    } finally {
      setSending(false);
    }
  };

  // Show mic permission error
  if (permissionError) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
        isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'
      }`}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="flex-1">{permissionError}</span>
        <button onClick={clearRecording} className="underline">Dismiss</button>
      </div>
    );
  }

  // Recording in progress
  if (isRecording) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
        isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-600'}`}>
          Recording {formatDuration(duration)} / {formatDuration(MAX_DURATION)}
        </span>
        <div className="flex-1" />
        <button
          onClick={cancelRecording}
          className={`p-1.5 rounded-lg text-sm transition-all ${
            isDark ? 'hover:bg-white/10 text-dark-muted' : 'hover:bg-gray-200 text-gray-500'
          }`}
          title="Cancel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={stopRecording}
          className="p-1.5 rounded-lg gradient-accent text-white transition-all hover:opacity-90"
          title="Stop & Preview"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </button>
      </div>
    );
  }

  // Preview recorded audio
  if (audioUrl) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
        isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
      }`}>
        <audio src={audioUrl} controls className="flex-1 h-8" style={{ maxWidth: '200px' }} />
        <button
          onClick={clearRecording}
          className={`p-1.5 rounded-lg text-sm transition-all ${
            isDark ? 'hover:bg-white/10 text-dark-muted' : 'hover:bg-gray-200 text-gray-500'
          }`}
          title="Discard"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-4 py-1.5 rounded-lg gradient-accent text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    );
  }

  // Default: just the mic button
  return (
    <button
      onClick={startRecording}
      className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-dark-muted hover:text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
      }`}
      title="Record voice message"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

export default AudioRecorder;
