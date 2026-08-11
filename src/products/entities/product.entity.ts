import { Site } from 'src/common/types/site.type';

export interface ProductCreateInput {
  url: string;
  site: Site;
  name: string;
}

export class Product {
  readonly id: string;
  readonly url: string;
  readonly site: Site;
  readonly name: string;

  private constructor(input: ProductCreateInput & { id: string }) {
    this.id = input.id;
    this.url = input.url;
    this.site = input.site;
    this.name = input.name;
  }

  static create(input: ProductCreateInput): Product {
    return new Product({ ...input, id: crypto.randomUUID() });
  }
}
