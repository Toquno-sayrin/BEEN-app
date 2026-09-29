import { Platform } from 'react-native';

export const colors = {
  // Neutrals matched to the "MY WORLD" wireframe's blue-teal-gray tone (기록/2026-09-28-메인-와이어프레임.html).
  ink: '#243D43',
  muted: '#71848B',
  line: '#D9E3E9',
  paper: '#F8FBFD',
  white: '#FFFFFF',
  primary: 'rgba(30, 125, 95, 0.8)',
  primarySoft: '#F0F7F4',
  accent: 'rgba(42, 164, 132, 0.8)',
  accentSoft: '#D7EFE5',
  // Utility-button soft background, sampled from assets/스와치컬러.png; pairs with `accent` as the solid/text color.
  utilitySoft: '#A0DDD6',
  info: 'rgba(124, 172, 67, 0.8)',
  infoSoft: '#EDF5DC',
  brand: '#389C83',
  // Blue family sampled directly from the logo mark, not approximated elsewhere.
  blue: 'rgba(46, 152, 231, 0.8)', // vivid blue, from the "B" of the wordmark
  blueMid: '#7ABDF0', // the mark's middle circle
  blueSoft: '#DCEEFF', // the mark's lightest circle, lightened for washes
};

// Glassmorphism elevation scale: each level pairs a BlurView intensity with a
// translucent tint, border, and shadow, so deeper-floating cards read as more
// "lifted" than shallow ones. Use with the GlassSurface component.
export const glass = {
  1: {
    blurIntensity: 20,
    tint: 'rgba(255,255,255,0.35)',
    border: 'rgba(255,255,255,0.5)',
    shadow: { shadowColor: colors.ink, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  },
  2: {
    blurIntensity: 35,
    tint: 'rgba(255,255,255,0.45)',
    border: 'rgba(255,255,255,0.6)',
    shadow: { shadowColor: colors.ink, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  },
  3: {
    blurIntensity: 50,
    tint: 'rgba(255,255,255,0.55)',
    border: 'rgba(255,255,255,0.7)',
    shadow: { shadowColor: colors.ink, shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  },
} as const;

export const tagPalette = [
  { bg: colors.primarySoft, text: colors.primary },
  { bg: colors.infoSoft, text: colors.info },
  { bg: colors.accentSoft, text: colors.accent },
];

export const gradients = {
  hero: [colors.primarySoft, colors.infoSoft] as const,
  // Vivid gradient sampled from the "BeeNIN" wordmark's B, used for search-bar borders
  // and primary gradient buttons (PlaceExplorer's search pill, etc.).
  search: ['#2E98E7', '#7ABDF0', '#389C83'] as const,
  // Pastel gradient sampled from the beenin-mark.png circles at 70% opacity, used as the
  // shared button fill across all tabs so every screen's buttons read as one family.
  button: ['rgba(187,213,252,0.7)', 'rgba(122,189,240,0.7)', 'rgba(179,238,209,0.7)'] as const,
};

// Dotted-grid app background from the BeeNIN concept board. CSS background-image
// patterns only render through react-native-web on web; native platforms have no
// tile asset yet, so they keep the flat paper color.
export const dotGrid = Platform.OS === 'web'
  ? ({ backgroundColor: colors.paper, backgroundImage: 'radial-gradient(circle, #C7DCE8 1px, transparent 1.5px)', backgroundSize: '22px 22px' } as const)
  : ({ backgroundColor: colors.paper } as const);

export const fonts = {
  light: 'NotoSansKR_300Light',
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  semibold: 'NotoSansKR_600SemiBold',
  bold: 'NotoSansKR_700Bold',
  extrabold: 'NotoSansKR_800ExtraBold',
  black: 'NotoSansKR_900Black',
};

export const radius = {
  small: 10,
  medium: 18,
  large: 28,
};
