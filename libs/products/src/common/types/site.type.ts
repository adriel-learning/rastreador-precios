export const SITE_VALUES = ['mercadolibre', 'garbarino'] as const;

export type Site = (typeof SITE_VALUES)[number];
