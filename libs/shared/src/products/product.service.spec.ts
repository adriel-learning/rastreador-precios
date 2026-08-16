import { Product } from './entities/product.entity';
import { IProductRepository } from './repositories/interfaces/product-repository.interface';
import { PriceSnapshotService } from './price-snapshot.service';
import { ProductService } from './product.service';

function makeProduct() {
  return Product.fromPersistence({
    id: 'p1',
    url: 'https://megatone.com/producto-x',
    site: 'megatone',
    name: 'Producto X',
    highestPrice: 500,
    imageUrl: null,
  });
}

function makeProductRepo(
  overrides: Partial<jest.Mocked<IProductRepository>> = {},
) {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  } as jest.Mocked<IProductRepository>;
}

function makeSnapshotService(
  overrides: Partial<jest.Mocked<PriceSnapshotService>> = {},
) {
  return {
    findLatestPerProduct: jest.fn(),
    findByProduct: jest.fn(),
    ...overrides,
  } as jest.Mocked<PriceSnapshotService>;
}

describe('product.service', () => {
  describe('findAllWithPrice()', () => {
    it('agrega currentPrice y lastCheckedAt del último snapshot de cada producto', async () => {
      const product = makeProduct();
      const mockProductRepo = makeProductRepo({
        findAll: jest.fn().mockResolvedValue([product]),
      });
      const mockSnapshotService = makeSnapshotService({
        findLatestPerProduct: jest.fn().mockResolvedValue([
          {
            productId: 'p1',
            price: 300,
            timestamp: new Date('2026-01-02'),
          },
        ]),
      });
      const service = new ProductService(mockProductRepo, mockSnapshotService);

      const result = await service.findAllWithPrice();

      expect(result).toEqual([
        {
          ...product,
          currentPrice: 300,
          lastCheckedAt: new Date('2026-01-02'),
        },
      ]);
    });

    it('deja currentPrice y lastCheckedAt en null si el producto no tiene snapshots', async () => {
      const product = makeProduct();
      const mockProductRepo = makeProductRepo({
        findAll: jest.fn().mockResolvedValue([product]),
      });
      const mockSnapshotService = makeSnapshotService({
        findLatestPerProduct: jest.fn().mockResolvedValue([]),
      });
      const service = new ProductService(mockProductRepo, mockSnapshotService);

      const result = await service.findAllWithPrice();

      expect(result[0]).toMatchObject({
        id: 'p1',
        currentPrice: null,
        lastCheckedAt: null,
      });
    });
  });

  describe('findByIdWithDetails()', () => {
    it('devuelve el producto con currentPrice/lastCheckedAt del último punto del historial', async () => {
      const product = makeProduct();
      const priceHistory = [
        { price: 300, timestamp: new Date('2026-01-01') },
        { price: 250, timestamp: new Date('2026-01-02') },
      ];
      const mockProductRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const mockSnapshotService = makeSnapshotService({
        findByProduct: jest.fn().mockResolvedValue(priceHistory),
      });
      const service = new ProductService(mockProductRepo, mockSnapshotService);

      const result = await service.findByIdWithDetails('p1', 200);

      expect(mockSnapshotService.findByProduct).toHaveBeenCalledWith('p1', 200);
      expect(result).toEqual({
        ...product,
        currentPrice: 250,
        lastCheckedAt: new Date('2026-01-02'),
        priceHistory,
      });
    });

    it('deja currentPrice y lastCheckedAt en null sin historial', async () => {
      const product = makeProduct();
      const mockProductRepo = makeProductRepo({
        findById: jest.fn().mockResolvedValue(product),
      });
      const mockSnapshotService = makeSnapshotService({
        findByProduct: jest.fn().mockResolvedValue([]),
      });
      const service = new ProductService(mockProductRepo, mockSnapshotService);

      const result = await service.findByIdWithDetails('p1', 200);

      expect(result).toMatchObject({
        id: 'p1',
        currentPrice: null,
        lastCheckedAt: null,
        priceHistory: [],
      });
    });
  });
});
