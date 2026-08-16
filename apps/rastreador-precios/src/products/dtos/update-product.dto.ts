import { createZodDto } from 'nestjs-zod';
import { updateProductSchema } from '@app/shared/products';

export class UpdateProductDto extends createZodDto(updateProductSchema) {}
