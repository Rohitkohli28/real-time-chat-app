import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className={`w-full max-w-md animate-fade-in ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className={`mt-2 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            Sign in to continue to ChatApp
          </p>
        </div>

        {/* Form */}
        <form
          id="login-form"
          onSubmit={handleSubmit}
          className={`p-8 rounded-2xl shadow-xl ${isDark ? 'glass' : 'bg-white border border-gray-200'}`}
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Email Address
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-accent text-white font-semibold
                         hover:opacity-90 transition-all transform hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <p className={`text-center mt-6 text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-dark-accent hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
