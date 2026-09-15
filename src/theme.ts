export const colors = {
  ink: '#221F2E',
  muted: '#8B879B',
  line: '#E8E6EF',
  paper: '#FFFFFF',
  white: '#FFFFFF',
  primary: 'rgba(242, 120, 159, 0.7)',
  primarySoft: '#FDE3EC',
  accent: 'rgba(226, 87, 143, 0.7)',
  accentSoft: '#FBD0DE',
  info: 'rgba(246, 168, 196, 0.7)',
  infoSoft: '#FDEFF4',
  brand: 'rgba(226, 87, 143, 0.7)',
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
