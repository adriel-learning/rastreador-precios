import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SITE_VALUES } from '@app/products';

const CreateProductSchema = z.object({
  url: z.url(),
  site: z.enum(SITE_VALUES),
  name: z.string().min(1),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
