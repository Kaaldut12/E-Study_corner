// frontend/src/utils/themes.js

export const THEMES = [
  {
    id: 'indigo',
    label: 'Electric Indigo',
    category: 'Signature AI',
    hex: '#6366f1',
    accentGrad: 'from-indigo-600 via-indigo-500 to-purple-500',
    gradientCss: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)',
    borderCol: 'border-indigo-500/50',
    glowCol: 'rgba(99, 102, 241, 0.35)',
    swatches: ['#3730a3', '#6366f1', '#a5b4fc', '#e0e7ff'],
    description: 'Signature platform intelligence palette with royal indigo, electric violet, and glowing lilac highlights.'
  },
  {
    id: 'sapphire',
    label: 'Ocean Sapphire',
    category: 'Executive',
    hex: '#0284c7',
    accentGrad: 'from-sky-500 via-blue-600 to-indigo-600',
    gradientCss: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #2563eb 100%)',
    borderCol: 'border-sky-500/50',
    glowCol: 'rgba(14, 165, 233, 0.35)',
    swatches: ['#075985', '#0284c7', '#38bdf8', '#bae6fd'],
    description: 'Deep ocean cobalt and crystal azure. Authoritative, crisp, and high-clarity professional design.'
  },
  {
    id: 'emerald',
    label: 'Cyber Emerald',
    category: 'Productivity',
    hex: '#059669',
    accentGrad: 'from-emerald-600 via-emerald-500 to-teal-500',
    gradientCss: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
    borderCol: 'border-emerald-500/50',
    glowCol: 'rgba(16, 185, 129, 0.35)',
    swatches: ['#065f46', '#059669', '#34d399', '#a7f3d0'],
    description: 'Lush biometric emerald, fresh mint, and cyber jade. Stimulates prolonged focus and rapid learning.'
  },
  {
    id: 'teal',
    label: 'Tidal Teal',
    category: 'Fresh Focus',
    hex: '#0d9488',
    accentGrad: 'from-teal-600 via-teal-500 to-cyan-500',
    gradientCss: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #06b6d4 100%)',
    borderCol: 'border-teal-500/50',
    glowCol: 'rgba(20, 184, 166, 0.35)',
    swatches: ['#115e59', '#0d9488', '#2dd4bf', '#99f6e4'],
    description: 'Crisp oceanic cyan and calming marine teal. Relaxing, modern, and optimal for extensive reading.'
  },
  {
    id: 'amber',
    label: 'Solar Amber',
    category: 'Warm Radiance',
    hex: '#d97706',
    accentGrad: 'from-amber-600 via-amber-500 to-orange-500',
    gradientCss: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    borderCol: 'border-amber-500/50',
    glowCol: 'rgba(245, 158, 11, 0.35)',
    swatches: ['#92400e', '#d97706', '#fbbf24', '#fde68a'],
    description: 'Radiant golden amber and sunset honey. Inspires creative spark, warmth, and intellectual energy.'
  },
  {
    id: 'rose',
    label: 'Neon Rose',
    category: 'High Impact',
    hex: '#e11d48',
    accentGrad: 'from-rose-600 via-rose-500 to-pink-500',
    gradientCss: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #ec4899 100%)',
    borderCol: 'border-rose-500/50',
    glowCol: 'rgba(225, 29, 72, 0.35)',
    swatches: ['#9f1239', '#e11d48', '#fb7185', '#fecdd3'],
    description: 'Vivid cyberpunk ruby, luminous rose, and hot magenta. Bold, dynamic, and unmistakable presence.'
  },
  {
    id: 'amethyst',
    label: 'Amethyst Purple',
    category: 'Royal Luxury',
    hex: '#7e22ce',
    accentGrad: 'from-purple-700 via-purple-600 to-fuchsia-500',
    gradientCss: 'linear-gradient(135deg, #581c87 0%, #7e22ce 50%, #a855f7 100%)',
    borderCol: 'border-purple-500/50',
    glowCol: 'rgba(147, 51, 234, 0.35)',
    swatches: ['#581c87', '#7e22ce', '#c084fc', '#e9d5ff'],
    description: 'Majestic deep violet and imperial orchid. Luxurious, scholarly, and exceptionally refined.'
  },
  {
    id: 'coral',
    label: 'Sunset Coral',
    category: 'Spirited',
    hex: '#c2410c',
    accentGrad: 'from-orange-600 via-orange-500 to-rose-500',
    gradientCss: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f97316 100%)',
    borderCol: 'border-orange-500/50',
    glowCol: 'rgba(234, 88, 12, 0.35)',
    swatches: ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa'],
    description: 'Tropical terracotta, mandarin, and warm coral glow. Spirited, charismatic, and welcoming.'
  },
  {
    id: 'slate',
    label: 'Midnight Slate',
    category: 'Architectural',
    hex: '#475569',
    accentGrad: 'from-slate-700 via-slate-600 to-zinc-600',
    gradientCss: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)',
    borderCol: 'border-slate-500/50',
    glowCol: 'rgba(100, 116, 139, 0.35)',
    swatches: ['#1e293b', '#475569', '#94a3b8', '#e2e8f0'],
    description: 'Stealth graphite, cool titanium, and architectural slate. Minimalist, quiet luxury, and zero distraction.'
  }
];

export const MODES = [
  {
    id: 'dark',
    label: 'Dark Theme',
    badge: 'Midnight Obsidian',
    icon: '🌙',
    description: 'Futuristic midnight obsidian canvas with luminous neon glowing glassmorphic elements.'
  },
  {
    id: 'light',
    label: 'Lite Theme',
    badge: 'Daylight Canvas',
    icon: '☀️',
    description: 'Crisp, luminous daylight interface with high-contrast typography and frosted pearl panels.'
  }
];
