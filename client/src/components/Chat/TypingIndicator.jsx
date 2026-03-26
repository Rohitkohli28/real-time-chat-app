import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';

const TypingIndicator = ({ users }) => {
  const { theme } = useContext(ChatContext);
  const isDark = theme === 'dark';

  if (!users || users.length === 0) return null;

  const names = users.map((u) => u.username);
  let text;
  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names.length} people are typing`;
  }

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <div className="flex gap-1">
        <span
          className={`w-2 h-2 rounded-full animate-bounce-dot ${
            isDark ? 'bg-dark-muted' : 'bg-gray-400'
          }`}
          style={{ animationDelay: '0s' }}
        />
        <span
          className={`w-2 h-2 rounded-full animate-bounce-dot ${
            isDark ? 'bg-dark-muted' : 'bg-gray-400'
          }`}
          style={{ animationDelay: '0.16s' }}
        />
        <span
          className={`w-2 h-2 rounded-full animate-bounce-dot ${
            isDark ? 'bg-dark-muted' : 'bg-gray-400'
          }`}
          style={{ animationDelay: '0.32s' }}
        />
      </div>
      <span className={`text-xs italic ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  );
};

export default TypingIndicator;
