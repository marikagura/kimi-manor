// theme.js — design tokens.
// (lib/mucha-tokens.ts ivory.dark + lib/day-theme.ts ROSE_GOTHIC_DAY).
// Two colorways: night (Mucha ivory dark, default) + day (rose-gothic).

export const NIGHT = {
  bg:     'radial-gradient(ellipse at 50% 10%, #1a1612 0%, #0a0806 70%)',
  void:   '#0a0806',
  paper:  '#100c08',
  ink:    '#f3e6cd',
  accent: '#c19a56',   // antique gold
  accent2:'#8a9b6e',   // sage
  mute:   'rgba(243, 230, 205, 0.55)',
  hair:   'rgba(193, 154, 86, 0.38)',
  rose:   '#a86b6b',   // muted rose for "toward her" register
};

export const DAY = {
  bg:     'linear-gradient(180deg, #fbf5f0 0%, #f6ebe4 45%, #efdcd4 100%)',
  void:   '#fbf5f0',
  paper:  'rgba(255, 252, 250, 0.82)',
  ink:    '#4a2c2c',
  accent: '#a04d5a',   // rose
  accent2:'#7a2e3c',   // deep rose
  mute:   'rgba(74, 44, 44, 0.5)',
  hair:   'rgba(160, 77, 90, 0.25)',
  rose:   '#a04d5a',
};

export const COLORWAYS = { night: NIGHT, day: DAY };

// ---- xterm.js themes — keep CC's TUI readable inside each colorway ----
// Night: warm parchment on near-black, gold cursor, sage/rose/gold ANSI.
export const XTERM_NIGHT = {
  background: '#0d0a07',
  foreground: '#f3e6cd',
  cursor: '#c19a56',
  cursorAccent: '#0d0a07',
  selectionBackground: 'rgba(193,154,86,0.28)',
  black: '#2a2018', red: '#bf7d6d', green: '#8a9b6e', yellow: '#c19a56',
  blue: '#8a96a8', magenta: '#a86b6b', cyan: '#8fa99e', white: '#ddd0bd',
  brightBlack: '#5a4a3a', brightRed: '#d49a8a', brightGreen: '#a9b88a',
  brightYellow: '#e6c879', brightBlue: '#a8b4c4', brightMagenta: '#c890a0',
  brightCyan: '#aec6bb', brightWhite: '#f3e6cd',
};

// Day: dark rose-brown ink on warm ivory, rose cursor.
export const XTERM_DAY = {
  background: '#fbf5f0',
  foreground: '#4a2c2c',
  cursor: '#a04d5a',
  cursorAccent: '#fbf5f0',
  selectionBackground: 'rgba(160,77,90,0.22)',
  black: '#4a2c2c', red: '#a0471e', green: '#556b2f', yellow: '#9a6a2e',
  blue: '#4a5a78', magenta: '#a04d5a', cyan: '#4a6b62', white: '#7a6258',
  brightBlack: '#7a5c52', brightRed: '#b8542a', brightGreen: '#5a6b35',
  brightYellow: '#a87a38', brightBlue: '#5a6a88', brightMagenta: '#7a2e3c',
  brightCyan: '#5a7b70', brightWhite: '#2a1818',
};

export const XTERM_THEMES = { night: XTERM_NIGHT, day: XTERM_DAY };

// Terminal body MUST stay monospace (CC's boxes/diff/tables align by cell).
// Ligature-friendly mono stack.
export const XTERM_OPTIONS = {
  theme: XTERM_NIGHT,
  fontFamily: '"Maple Mono", "Fira Code", "Cascadia Code", "JetBrains Mono", "SFMono-Regular", "Menlo", monospace',
  fontSize: 13.5,
  lineHeight: 1.3,
  letterSpacing: 0.2,
  cursorBlink: true,
  cursorStyle: 'bar',
  scrollback: 8000,
  allowProposedApi: true,
  macOptionIsMeta: true,
  fontLigatures: true,
};
