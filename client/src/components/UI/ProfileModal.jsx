import { useState, useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import Avatar from './Avatar';

const ProfileModal = ({ isOpen, onClose }) => {
  const { theme } = useContext(ChatContext);
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
  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, isOpen]);

  // Close on click outside
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

  // Close on Escape
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

      // Broadcast the update via socket
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className={`w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden animate-slide-up ${
          isDark ? 'bg-dark-sidebar border border-white/10' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="relative gradient-accent px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex justify-center mb-3">
            <Avatar username={user.username} avatar={formData.avatar || user.avatar} size="xl" />
          </div>
          <h2 className="text-xl font-bold text-white">{user.username}</h2>
          <p className="text-white/70 text-sm">{user.email}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm input-focus-ring ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={200}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none input-focus-ring ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
                <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-400'}`}>
                  {formData.bio.length}/200
                </span>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm input-focus-ring ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                  Bio
                </span>
                <p className={`text-sm mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {user.bio || 'No bio yet. Click edit to add one!'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
