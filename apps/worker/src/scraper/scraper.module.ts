import { Module } from '@nestjs/common';
import { ScraperRegistry } from './scraper-registry.service';
import { MegatoneScraper } from './strategies/megatone.scraper';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ScraperRegistry, MegatoneScraper],
  exports: [ScraperRegistry],
})
export class ScraperModule {}
