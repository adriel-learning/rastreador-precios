import { Site } from '@app/shared/products/types/site.type';

export interface ProductCreateInput {
  url: string;
  site: Site;
  name: string;
  imageUrl?: string | null;
}

export interface ProductPersistenceInput extends ProductCreateInput {
  id: string;
  highestPrice: number | null;
}

export type ProductUpdateDetails = Partial<
  Pick<Product, 'url' | 'site' | 'name' | 'imageUrl'>
>;

export class Product {
  readonly id: string;
  url: string;
  site: Site;
  name: string;
  highestPrice: number | null;
  imageUrl: string | null;

  private constructor(input: ProductPersistenceInput) {
    this.id = input.id;
    this.url = input.url;
    this.site = input.site;
    this.name = input.name;
    this.highestPrice = input.highestPrice;
    this.imageUrl = input.imageUrl ?? null;
  }

  static create(input: ProductCreateInput): Product {
    return new Product({
      ...input,
      id: crypto.randomUUID(),
      highestPrice: null,
    });
  }

  static fromPersistence(input: ProductPersistenceInput): Product {
    return new Product(input);
  }

  updateDetails(changes: ProductUpdateDetails): void {
    if (changes.url !== undefined) this.url = changes.url;
    if (changes.site !== undefined) this.site = changes.site;
    if (changes.name !== undefined) this.name = changes.name;
    if (changes.imageUrl !== undefined) this.imageUrl = changes.imageUrl;
  }

  updateHighestPrice(highestPrice: number): void {
    if (this.highestPrice && this.highestPrice > highestPrice)
      throw new Error(`El precio envíado es menor al precio histórico máximo`);
    this.highestPrice = highestPrice;
  }
}
