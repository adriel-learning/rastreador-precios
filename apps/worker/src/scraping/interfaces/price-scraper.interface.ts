export interface PriceScraper {
  getPrice(url: string): Promise<number>;
}
