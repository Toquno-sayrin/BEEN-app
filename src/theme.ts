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
