/**
 * Voice command definitions and parser.
 * Each command has a pattern (regex), a handler name, and description.
 */

export const VOICE_COMMANDS = [
  // ═══ Quick Messaging (most frequently used) ═══
  {
    pattern: /^send message (.+)$/i,
    handler: 'sendMessage',
    description: '"send message [text]" - sends the text as a message',
    extract: (match) => ({ text: match[1] }),
  },
  {
    pattern: /^say (.+)$/i,
    handler: 'sendMessage',
    description: '"say [text]" - quickly send a message',
    extract: (match) => ({ text: match[1] }),
  },
  {
    pattern: /^type (.+)$/i,
    handler: 'typeMessage',
    description: '"type [text]" - types text in the input without sending',
    extract: (match) => ({ text: match[1] }),
  },
  {
    pattern: /^send$/i,
    handler: 'sendCurrent',
    description: '"send" - sends whatever is typed in the input',
  },

  // ═══ Quick Replies (one-word common phrases) ═══
  {
    pattern: /^(hello|hi|hey|yo)$/i,
    handler: 'quickReply',
    description: '"hello/hi/hey/yo" - sends a quick greeting',
    extract: (match) => ({ text: match[1] }),
  },
  {
    pattern: /^(good morning|good night|good evening|good afternoon)$/i,
    handler: 'quickReply',
    description: '"good morning/night/evening" - sends a greeting',
    extract: (match) => ({ text: match[1].charAt(0).toUpperCase() + match[1].slice(1) + '! 👋' }),
  },
  {
    pattern: /^(yes|yeah|yep|no|nope|nah)$/i,
    handler: 'quickReply',
    description: '"yes/no/yeah/nope" - sends a quick reply',
    extract: (match) => ({ text: match[1] }),
  },
  {
    pattern: /^(ok|okay|sure|alright|cool|nice|great|awesome|perfect|thanks|thank you|welcome)$/i,
    handler: 'quickReply',
    description: '"ok/sure/thanks/great/awesome" - sends a quick reply',
    extract: (match) => ({ text: match[1].charAt(0).toUpperCase() + match[1].slice(1) }),
  },
  {
    pattern: /^(lol|haha|lmao|rofl|brb|gtg|omg|wow|gg)$/i,
    handler: 'quickReply',
    description: '"lol/haha/brb/gtg/omg/wow" - sends common chat slang',
    extract: (match) => ({ text: match[1].toUpperCase() }),
  },
  {
    pattern: /^(bye|goodbye|see you|later|see you later|cya)$/i,
    handler: 'quickReply',
    description: '"bye/goodbye/see you later" - sends a farewell',
    extract: (match) => ({ text: match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' 👋' }),
  },

  // ═══ Emoji Insertion ═══
  {
    pattern: /^send (thumbs up|like|heart|fire|clap|party|smile|laugh|cry|thinking)$/i,
    handler: 'sendEmoji',
    description: '"send thumbs up/heart/fire/party/smile" - sends an emoji',
    extract: (match) => ({ emoji: match[1].toLowerCase() }),
  },

  // ═══ Message Management ═══
  {
    pattern: /^clear message$/i,
    handler: 'clearMessage',
    description: '"clear message" - clears the current input field',
  },
  {
    pattern: /^clear$/i,
    handler: 'clearMessage',
    description: '"clear" - clears the input field',
  },
  {
    pattern: /^delete last message$/i,
    handler: 'deleteLastMessage',
    description: '"delete last message" - deletes your last sent message',
  },
  {
    pattern: /^undo$/i,
    handler: 'deleteLastMessage',
    description: '"undo" - deletes your last sent message',
  },

  // ═══ Room Navigation ═══
  {
    pattern: /^go to (.+)$/i,
    handler: 'switchRoom',
    description: '"go to [room]" - switches to the named room',
    extract: (match) => ({ roomName: match[1].trim() }),
  },
  {
    pattern: /^switch room (.+)$/i,
    handler: 'switchRoom',
    description: '"switch room [name]" - switches to named room',
    extract: (match) => ({ roomName: match[1].trim() }),
  },
  {
    pattern: /^(join|open) (.+)$/i,
    handler: 'switchRoom',
    description: '"join/open [room]" - joins or opens a room',
    extract: (match) => ({ roomName: match[2].trim() }),
  },
  {
    pattern: /^next room$/i,
    handler: 'nextRoom',
    description: '"next room" - switches to the next room in the list',
  },
  {
    pattern: /^previous room$/i,
    handler: 'previousRoom',
    description: '"previous room" - switches to the previous room',
  },
  {
    pattern: /^what room$/i,
    handler: 'whatRoom',
    description: '"what room" - tells you which room you\'re in',
  },

  // ═══ UI Controls ═══
  {
    pattern: /^scroll up$/i,
    handler: 'scrollUp',
    description: '"scroll up" - scrolls chat window up',
  },
  {
    pattern: /^scroll down$/i,
    handler: 'scrollDown',
    description: '"scroll down" - scrolls chat window down',
  },
  {
    pattern: /^scroll (to )?top$/i,
    handler: 'scrollTop',
    description: '"scroll top" - scrolls to the top of chat',
  },
  {
    pattern: /^scroll (to )?bottom$/i,
    handler: 'scrollBottom',
    description: '"scroll bottom" - scrolls to the bottom of chat',
  },
  {
    pattern: /^toggle sidebar$/i,
    handler: 'toggleSidebar',
    description: '"toggle sidebar" - show/hide the sidebar',
  },
  {
    pattern: /^(show|open) sidebar$/i,
    handler: 'showSidebar',
    description: '"show sidebar" - opens the sidebar',
  },
  {
    pattern: /^(hide|close) sidebar$/i,
    handler: 'hideSidebar',
    description: '"hide sidebar" - hides the sidebar',
  },
  {
    pattern: /^dark mode$/i,
    handler: 'darkMode',
    description: '"dark mode" - switch to dark theme',
  },
  {
    pattern: /^light mode$/i,
    handler: 'lightMode',
    description: '"light mode" - switch to light theme',
  },
  {
    pattern: /^(toggle theme|switch theme)$/i,
    handler: 'toggleTheme',
    description: '"toggle theme" - switches between dark/light',
  },
  {
    pattern: /^(show|open) (profile|my profile)$/i,
    handler: 'openProfile',
    description: '"show profile" - opens your profile modal',
  },
  {
    pattern: /^(show|open) notifications$/i,
    handler: 'openNotifications',
    description: '"show notifications" - opens notification panel',
  },
  {
    pattern: /^clear notifications$/i,
    handler: 'clearNotifications',
    description: '"clear notifications" - clears all notifications',
  },
  {
    pattern: /^(mute|unmute)$/i,
    handler: 'toggleMute',
    description: '"mute/unmute" - toggles notification sounds',
  },
  {
    pattern: /^focus$/i,
    handler: 'focusInput',
    description: '"focus" - focuses the message input box',
  },

  // ═══ User Actions ═══
  {
    pattern: /^log ?out$/i,
    handler: 'logout',
    description: '"log out" - logs you out',
  },
  {
    pattern: /^who is online$/i,
    handler: 'whoIsOnline',
    description: '"who is online" - announces online user count',
  },
  {
    pattern: /^(online|users online)$/i,
    handler: 'whoIsOnline',
    description: '"online" - shows online user count',
  },
  {
    pattern: /^help$/i,
    handler: 'help',
    description: '"help" - shows list of voice commands',
  },
  {
    pattern: /^(commands|voice commands|show commands)$/i,
    handler: 'help',
    description: '"commands" - shows available voice commands',
  },
];

/**
 * Parse a transcript and return the matched command and extracted data.
 */
export const parseVoiceCommand = (transcript) => {
  const normalized = transcript.trim().toLowerCase();

  for (const command of VOICE_COMMANDS) {
    const match = normalized.match(command.pattern);
    if (match) {
      return {
        handler: command.handler,
        data: command.extract ? command.extract(match) : {},
        description: command.description,
      };
    }
  }

  return null;
};

/**
 * Fuzzy match a room name from a spoken name.
 */
export const fuzzyMatchRoom = (spokenName, rooms) => {
  const normalized = spokenName.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  // Exact match first
  const exact = rooms.find(
    (r) => r.name.toLowerCase() === normalized ||
           r.name.toLowerCase().replace(/-/g, ' ') === normalized
  );
  if (exact) return exact;

  // Partial match
  const partial = rooms.find(
    (r) =>
      r.name.toLowerCase().includes(normalized) ||
      normalized.includes(r.name.toLowerCase().replace(/-/g, ' '))
  );
  if (partial) return partial;

  // Distance-based fuzzy
  let bestMatch = null;
  let bestScore = 0;

  for (const room of rooms) {
    const roomName = room.name.toLowerCase().replace(/-/g, ' ');
    const words = normalized.split(' ');
    let score = 0;
    for (const word of words) {
      if (roomName.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = room;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

export default { VOICE_COMMANDS, parseVoiceCommand, fuzzyMatchRoom };
