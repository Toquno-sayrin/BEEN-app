export const colors = {
  ink: '#221F2E',
  muted: '#8B879B',
  line: '#E8E6EF',
  paper: '#F4F4F4',
  white: '#FFFFFF',
  primary: '#8C7BEB',
  primarySoft: '#ECE8FC',
  accent: '#F2789F',
  accentSoft: '#FDCBDB',
  info: '#4FA6C2',
  infoSoft: '#C4F1FE',
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
