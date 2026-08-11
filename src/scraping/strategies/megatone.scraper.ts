import { Injectable } from '@nestjs/common';
import { PriceScraper } from '../interfaces/price-scraper.interface';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MegatoneScraper implements PriceScraper {
  constructor(
    private readonly http: HttpService, // @nestjs/axios
    private readonly config: ConfigService<Env>,
  ) {}

  async getPrice(url: string): Promise<number> {
    const sku = this.extractSku(url);
    const response = await firstValueFrom(
      this.http.post(
        'https://www.megatone.net/apirecursoswebv2/api/Productos/ObtenerA',
        {
          sku,
          token: this.config.get('MEGATONE_API_TOKEN', { infer: true }),
        },
      ),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const price = response.data?.precios?.web?.promocional ?? '';
    if (typeof price !== 'number' || price <= 0) {
      throw new Error(`Precio inválido recibido de Megatone para sku ${sku}`);
    }
    return price;
  }

  private extractSku(url: string): string {
    const match = url.match(/_([A-Z0-9]+)\/?$/);
    if (!match) throw new Error(`No se pudo extraer el sku de la url: ${url}`);
    return match[1];
  }
}
