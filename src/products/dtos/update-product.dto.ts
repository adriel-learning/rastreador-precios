import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SITE_VALUES } from '@app/products';

const UpdateProductSchema = z.object({
  url: z.url().optional(),
  site: z.enum(SITE_VALUES).optional(),
  name: z.string().min(1).optional(),
});

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
