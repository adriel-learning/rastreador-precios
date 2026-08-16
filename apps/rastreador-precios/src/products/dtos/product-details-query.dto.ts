import { createZodDto } from 'nestjs-zod';
import { productDetailsQuerySchema } from '@app/shared/products';

export class ProductDetailsQueryDto extends createZodDto(
  productDetailsQuerySchema,
) {}
