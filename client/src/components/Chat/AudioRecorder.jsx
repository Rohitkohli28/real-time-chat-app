import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
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

  if (permissionError) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-rose-950/60 text-rose-200 border border-rose-500/30">
        <span className="flex-1">{permissionError}</span>
        <button onClick={clearRecording} className="underline text-slate-300">Dismiss</button>
      </div>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-950/60 border border-rose-500/30 backdrop-blur-md shadow-lg"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
        </span>
        <span className="text-xs font-mono font-bold text-rose-200">
          {formatDuration(duration)} / {formatDuration(MAX_DURATION)}
        </span>
        <button
          onClick={cancelRecording}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Cancel"
        >
          ✕
        </button>
        <button
          onClick={stopRecording}
          className="px-3 py-1 rounded-xl gradient-accent text-white text-xs font-bold shadow-glow-accent hover:opacity-90 transition-all"
          title="Stop & Preview"
        >
          Done
        </button>
      </motion.div>
    );
  }

  // Preview state
  if (audioUrl) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl glass-card border border-white/10"
      >
        <audio src={audioUrl} controls className="h-7 max-w-[160px]" />
        <button
          onClick={clearRecording}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Discard"
        >
          🗑️
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-3 py-1.5 rounded-xl gradient-accent text-white text-xs font-bold shadow-glow-accent hover:opacity-90 disabled:opacity-50"
        >
          {sending ? '...' : 'Send'}
        </button>
      </motion.div>
    );
  }

  // Mic Button
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={startRecording}
      className="p-3 rounded-2xl glass-pill text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-all"
      title="Record Voice Note"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </motion.button>
  );
};

export default AudioRecorder;
