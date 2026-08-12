import { Injectable } from '@nestjs/common';
import { MegatoneScraper } from './strategies/megatone.scraper';
import { PriceScraper } from './interfaces/price-scraper.interface';
import { Site } from '@app/shared/products';

@Injectable()
export class ScraperRegistry {
  private readonly scrapers: Partial<Record<Site, PriceScraper>>;

  constructor(private readonly megatoneScraper: MegatoneScraper) {
    this.scrapers = {
      megatone: this.megatoneScraper,
    };
  }

  resolve(site: Site): PriceScraper {
    const scraper = this.scrapers[site];
    if (!scraper)
      throw new Error(`No hay scraper registrado para el sitio: ${site}`);

    return scraper;
  }
}
