const COLORS = [
  '#e94560', '#6c63ff', '#00b894', '#fd79a8',
  '#0984e3', '#e17055', '#00cec9', '#a29bfe',
  '#fab1a0', '#55efc4', '#fdcb6e', '#74b9ff',
];

const getColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const Avatar = ({ username = '', avatar = '', size = 'md', isOnline = false }) => {
  const initials = getInitials(username || '?');
  const bgColor = getColor(username || 'default');

  return (
    <div className="relative inline-flex">
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white/20`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white/10`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-sidebar" />
      )}
    </div>
  );
};

export default Avatar;
