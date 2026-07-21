import { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import Avatar from './Avatar';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: '',
  });
  const modalRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      if (socket) {
        socket.emit('profile_updated', {
          username: data.username,
          avatar: data.avatar,
          bio: data.bio,
        });
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-md rounded-3xl glass-panel shadow-2xl overflow-hidden relative z-10 border border-white/10"
          >
            {/* Gradient Header Cover */}
            <div className="relative gradient-accent px-6 pt-10 pb-8 text-center shadow-lg">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all backdrop-blur-md"
              >
                ✕
              </button>
              <div className="flex justify-center mb-3">
                <div className="relative group">
                  <Avatar username={user.username} avatar={formData.avatar || user.avatar} size="xl" />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-md" />
                </div>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{user.username}</h2>
              <p className="text-white/80 text-xs font-mono mt-0.5">{user.email}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-semibold">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
                  {success}
                </div>
              )}

              {isEditing ? (
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      maxLength={200}
                      rows={3}
                      placeholder="Tell the channel about yourself..."
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100 outline-none resize-none"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formData.bio.length}/200
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-100 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl gradient-accent text-white text-xs font-extrabold shadow-glow-accent hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user.username || '',
                          bio: user.bio || '',
                          avatar: user.avatar || '',
                        });
                      }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-2xl glass-card border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      About
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {user.bio || 'No bio added yet. Click edit profile to express yourself!'}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 rounded-2xl gradient-accent text-white text-xs font-extrabold shadow-glow-accent hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile Details
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
