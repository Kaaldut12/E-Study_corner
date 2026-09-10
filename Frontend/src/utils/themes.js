// frontend/src/utils/themes.js

export const THEMES = [
  {
    id: 'indigo',
    label: 'Electric Indigo',
    hex: '#6366f1',
    accentGrad: 'from-indigo-500 via-indigo-600 to-purple-600',
    borderCol: 'border-indigo-500/40',
    glowCol: 'rgba(99, 102, 241, 0.25)',
    description: 'Signature deep-space cosmic violet. Crisp, authoritative, and sleek.'
  },
  {
    id: 'emerald',
    label: 'Cyber Emerald',
    hex: '#10b981',
    accentGrad: 'from-emerald-500 via-emerald-600 to-teal-600',
    borderCol: 'border-emerald-500/40',
    glowCol: 'rgba(16, 185, 129, 0.25)',
    description: 'Vibrant neon matrix emerald & mint. High energy and optimal focus.'
  },
  {
    id: 'amber',
    label: 'Solar Amber',
    hex: '#f59e0b',
    accentGrad: 'from-amber-500 via-amber-600 to-orange-600',
    borderCol: 'border-amber-500/40',
    glowCol: 'rgba(245, 158, 11, 0.25)',
    description: 'Warm dusk solar tones. Rich golden highlights with fiery sunset accents.'
  },
  {
    id: 'rose',
    label: 'Neon Rose',
    hex: '#f43f5e',
    accentGrad: 'from-rose-500 via-rose-600 to-pink-600',
    borderCol: 'border-rose-500/40',
    glowCol: 'rgba(244, 63, 94, 0.25)',
    description: 'Striking cyberpunk crimson and hot magenta. Bold, modern, and high impact.'
  },
  {
    id: 'sapphire',
    label: 'Ocean Sapphire',
    hex: '#0ea5e9',
    accentGrad: 'from-sky-500 via-blue-600 to-indigo-600',
    borderCol: 'border-sky-500/40',
    glowCol: 'rgba(14, 165, 233, 0.25)',
    description: 'Crystal azure and deep ocean sapphire. Calm, professional, and refreshing.'
  },
  {
    id: 'amethyst',
    label: 'Amethyst Purple',
    hex: '#9333ea',
    accentGrad: 'from-purple-500 via-fuchsia-600 to-pink-600',
    borderCol: 'border-purple-500/40',
    glowCol: 'rgba(147, 51, 234, 0.25)',
    description: 'Royal amethyst and majestic lilac. Artistic, luxurious, and elegant.'
  },
  {
    id: 'coral',
    label: 'Sunset Coral',
    hex: '#ea580c',
    accentGrad: 'from-orange-500 via-rose-500 to-red-600',
    borderCol: 'border-orange-500/40',
    glowCol: 'rgba(234, 88, 12, 0.25)',
    description: 'Radiant tropical sunset coral and peach. Inviting, spirited, and warm.'
  },
  {
    id: 'slate',
    label: 'Midnight Slate',
    hex: '#64748b',
    accentGrad: 'from-slate-500 via-slate-600 to-zinc-700',
    borderCol: 'border-slate-500/40',
    glowCol: 'rgba(100, 116, 139, 0.25)',
    description: 'Minimalist titanium, cool graphite, and stealth steel. Clean and understated.'
  }
];

export const MODES = [
  {
    id: 'dark',
    label: 'Dark Theme',
    icon: '🌙',
    description: 'Futuristic midnight obsidian palette with glowing glassmorphic elements.'
  },
  {
    id: 'light',
    label: 'Lite Theme',
    icon: '☀️',
    description: 'Clean, luminous daylight interface with crisp contrast and frosted glass panels.'
  }
];
