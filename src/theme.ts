export const colors = {
  ink: '#221F2E',
  muted: '#8B879B',
  line: '#E8E6EF',
  paper: '#FFF7FA',
  white: '#FFFFFF',
  primary: '#F2789F',
  primarySoft: '#FDE3EC',
  accent: '#E2578F',
  accentSoft: '#FBD0DE',
  info: '#F6A8C4',
  infoSoft: '#FDEFF4',
  brand: '#E2578F',
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
