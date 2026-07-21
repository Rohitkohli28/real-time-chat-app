import { motion } from 'framer-motion';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const names = users.map((u) => u.username);
  let text;
  if (names.length === 1) {
    text = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing...`;
  } else {
    text = `${names.length} members are typing...`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-pill border border-white/10 w-fit text-slate-300 shadow-sm"
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full bg-pink-400"
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold tracking-wide">
        {text}
      </span>
    </motion.div>
  );
};

export default TypingIndicator;
