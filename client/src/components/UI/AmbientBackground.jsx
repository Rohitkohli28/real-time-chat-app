import { memo } from 'react';

const AmbientBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top Left Glowing Light */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[140px] opacity-25 dark:opacity-35 bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 animate-pulse-slow" 
      />

      {/* Center Bottom Ambient Glow */}
      <div 
        className="absolute -bottom-[20%] right-[15%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[160px] opacity-20 dark:opacity-30 bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-600 animate-float" 
      />

      {/* Top Right Subtle Accent Light */}
      <div 
        className="absolute top-[15%] right-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full blur-[130px] opacity-15 dark:opacity-25 bg-gradient-to-l from-fuchsia-600 to-purple-800" 
      />
      
      {/* Dark Subtle Mesh Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none" />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

export default AmbientBackground;
