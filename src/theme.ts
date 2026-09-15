import { Platform } from 'react-native';

export const colors = {
  ink: '#221F2E',
  muted: '#8B879B',
  line: '#E8E6EF',
  paper: '#F5FAF7',
  white: '#FFFFFF',
  primary: 'rgba(30, 125, 95, 0.8)',
  primarySoft: '#E4F3EB',
  accent: 'rgba(42, 164, 132, 0.8)',
  accentSoft: '#D7EFE5',
  info: 'rgba(124, 172, 67, 0.8)',
  infoSoft: '#EDF5DC',
  brand: '#389C83',
};

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
  ? ({ backgroundColor: '#FFFFFF', backgroundImage: 'radial-gradient(circle, #D8D8E2 1px, transparent 1.5px)', backgroundSize: '22px 22px' } as const)
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
