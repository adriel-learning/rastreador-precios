export const SITE_VALUES = [
  'mercadolibre',
  'garbarino',
  'megatone',
  'fravega',
] as const;

export type Site = (typeof SITE_VALUES)[number];
