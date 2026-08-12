import { Injectable } from '@nestjs/common';
import { PriceScraper } from '../interfaces/price-scraper.interface';
import { HttpService } from '@nestjs/axios';
import {
  FravegaApiResponse,
  fravegaApiResponseSchema,
} from '../responses/fravega-api.response';
import { firstValueFrom } from 'rxjs';

const FRAVEGA_API_QUERY = {
  query:
    'query compareProducts_Shopping($skus: [NonEmptyString!], $postalCode: PostalId) {\n  skus(filtering: {codes: $skus, salesChannels: "fravega-ecommerce"}) {\n    took\n    total\n    results(size: 4) {\n     code\n      item {\n        id\n        title\n        slug\n        katalogCategoryId\n        brand {\n          id\n          name\n          slug\n          image\n          __typename\n        }\n        images(size: 2)\n     }\n      pricing(channel: "fravega-ecommerce") {\n        channel\n        listPrice\n        salePrice\n        discount\n        __typename\n      }\n  stock(postalCode: $postalCode) {\n        labels\n        availability\n        __typename\n      }\n    }\n __typename\n }\n }\n',
};

@Injectable()
export class FravegaScraper implements PriceScraper {
  constructor(private readonly http: HttpService) {}

  async getPrice(url: string): Promise<number> {
    const sku = this.extractSku(url);

    const response = await firstValueFrom(
      this.http.post<FravegaApiResponse>('https://www.fravega.com/api/v1', {
        ...FRAVEGA_API_QUERY,
        variables: {
          skus: [sku],
        },
      }),
    );

    const parsed = fravegaApiResponseSchema.safeParse(response.data);
    if (!parsed.success)
      throw new Error(
        `Respuesta de Fravega con firma inesperada: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`,
      );

    const { data } = parsed.data;
    return data.skus.results[0].pricing[0].salePrice;
  }

  private extractSku(url: string) {
    const match = url.match(/(\d+)\/?$/);
    if (!match) throw new Error(`No se pudo extraer el sku de la url: ${url}`);
    return match[1];
  }
}
