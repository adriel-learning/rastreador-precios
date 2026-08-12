import { Injectable } from '@nestjs/common';
import { PriceScraper } from '../interfaces/price-scraper.interface';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../config/env.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  MegatoneApiResponse,
  megatoneApiResponseSchema,
} from '../responses/megatone-api.response';

@Injectable()
export class MegatoneScraper implements PriceScraper {
  constructor(
    private readonly http: HttpService, // @nestjs/axios
    private readonly config: ConfigService<Env>,
  ) {}

  async getPrice(url: string): Promise<number> {
    const sku = this.extractSku(url);
    const response = await firstValueFrom(
      this.http.post<MegatoneApiResponse>(
        'https://www.megatone.net/apirecursoswebv2/api/Productos/ObtenerA',
        {
          sku,
          token: this.config.get('MEGATONE_API_TOKEN', { infer: true }),
        },
      ),
    );

    const parsed = megatoneApiResponseSchema.safeParse(response.data);

    if (!parsed.success) {
      throw new Error(
        `Respuesta de Megatone con firma inesperada: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`,
      );
    }

    const { data } = parsed;
    return data.precios.web.promocional;
  }

  private extractSku(url: string): string {
    const match = url.match(/_([A-Z0-9]+)\/?$/);
    if (!match) throw new Error(`No se pudo extraer el sku de la url: ${url}`);
    return match[1];
  }
}
