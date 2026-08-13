export const SITE_VALUES = [
  'mercadolibre',
  'garbarino',
  'megatone',
  'fravega',
  'intachables',
] as const;

export type Site = (typeof SITE_VALUES)[number];
