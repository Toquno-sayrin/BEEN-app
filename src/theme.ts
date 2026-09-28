import { Platform } from 'react-native';

export const colors = {
  ink: '#221F2E',
  muted: '#8B879B',
  line: '#E8E6EF',
  // Base app background: reference swatch (assets/배경.jpg) lightened 50% toward white.
  paper: '#F7F8FA',
  white: '#FFFFFF',
  primary: 'rgba(30, 125, 95, 0.8)',
  primarySoft: '#E4F3EB',
  accent: 'rgba(42, 164, 132, 0.8)',
  accentSoft: '#D7EFE5',
  info: 'rgba(124, 172, 67, 0.8)',
  infoSoft: '#EDF5DC',
  brand: '#389C83',
  blue: 'rgba(46, 152, 231, 0.8)',
  blueSoft: '#DCEEFF',
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
};

// Dotted-grid app background from the BeeNIN concept board. CSS background-image
// patterns only render through react-native-web on web; native platforms have no
// tile asset yet, so they keep the flat paper color.
export const dotGrid = Platform.OS === 'web'
  ? ({ backgroundColor: colors.paper, backgroundImage: 'radial-gradient(circle, #D6D7E0 1px, transparent 1.5px)', backgroundSize: '22px 22px' } as const)
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
