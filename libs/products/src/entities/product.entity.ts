import { Site } from '../common/types/site.type';

export interface ProductCreateInput {
  url: string;
  site: Site;
  name: string;
}

export type ProductUpdateDetails = Partial<
  Pick<Product, 'url' | 'site' | 'name'>
>;

export class Product {
  readonly id: string;
  url: string;
  site: Site;
  name: string;

  private constructor(input: ProductCreateInput & { id: string }) {
    this.id = input.id;
    this.url = input.url;
    this.site = input.site;
    this.name = input.name;
  }

  static create(input: ProductCreateInput): Product {
    return new Product({ ...input, id: crypto.randomUUID() });
  }

  static fromPersistence(input: ProductCreateInput & { id: string }): Product {
    return new Product(input);
  }

  updateDetails(changes: ProductUpdateDetails): void {
    if (changes.url !== undefined) this.url = changes.url;
    if (changes.site !== undefined) this.site = changes.site;
    if (changes.name !== undefined) this.name = changes.name;
  }
}
