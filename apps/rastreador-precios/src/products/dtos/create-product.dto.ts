import { createZodDto } from 'nestjs-zod';
import { createProductSchema } from '@app/shared/products';

export class CreateProductDto extends createZodDto(createProductSchema) {}
