export const SITE_VALUES = ['mercadolibre', 'garbarino', 'megatone'] as const;

export type Site = (typeof SITE_VALUES)[number];
