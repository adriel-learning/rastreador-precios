import { Module } from '@nestjs/common';
import { ScraperRegistry } from './scraper-registry.service';
import { MegatoneScraper } from './strategies/megatone.scraper';
import { HttpModule } from '@nestjs/axios';
import { FravegaScraper } from './strategies/fravega.scraper';
import { IntachablesScraper } from './strategies/intachables.scraper';

@Module({
  imports: [HttpModule],
  providers: [
    ScraperRegistry,
    MegatoneScraper,
    FravegaScraper,
    IntachablesScraper,
  ],
  exports: [ScraperRegistry],
})
export class ScraperModule {}
