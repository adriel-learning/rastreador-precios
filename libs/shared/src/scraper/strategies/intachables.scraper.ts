import { Injectable } from '@nestjs/common';
import { PriceScraper } from '../interfaces/price-scraper.interface';
import { HttpService } from '@nestjs/axios';
import {
  IntachablesApiResponse,
  intachablesApiResponseSchema,
} from '../responses/intachables-api.response';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IntachablesScraper implements PriceScraper {
  constructor(private readonly http: HttpService) {}

  async getPrice(url: string): Promise<number> {
    const id = this.extractId(url);

    const response = await firstValueFrom(
      this.http.get<IntachablesApiResponse>(
        `https://intachables.com/api/product/find/${id}`,
      ),
    );

    const parsed = intachablesApiResponseSchema.safeParse(response.data);
    if (!parsed.success)
      throw new Error(
        `Respuesta de Intachables con firma inesperada: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`,
      );

    const { data } = parsed;
    return data.finalPrice;
  }

  private extractId(url: string): string {
    const match = url.match(/\/product\/([^/]+)\/?$/);
    if (!match) throw new Error(`No se pudo extraer el id de la url: ${url}`);
    return match[1];
  }
}
