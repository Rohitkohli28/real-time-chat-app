import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { theme } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className={`w-full max-w-md animate-fade-in ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className={`mt-2 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            Join ChatApp and start messaging
          </p>
        </div>

        {/* Form */}
        <form
          id="register-form"
          onSubmit={handleSubmit}
          className={`p-8 rounded-2xl shadow-xl ${isDark ? 'glass' : 'bg-white border border-gray-200'}`}
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="reg-username" className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
                minLength={3}
                maxLength={30}
                className={`w-full px-4 py-3 rounded-xl border transition-all input-focus-ring ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`w-full px-4 py-3 rounded-xl border transition-all input-focus-ring ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
              />
            </div>

            <div>
              <label htmlFor="reg-password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className={`w-full px-4 py-3 rounded-xl border transition-all input-focus-ring ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
              />
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3 rounded-xl border transition-all input-focus-ring ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
              />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-accent text-white font-semibold
                         hover:opacity-90 transition-all transform hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         shadow-lg mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <p className={`text-center mt-6 text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-dark-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
