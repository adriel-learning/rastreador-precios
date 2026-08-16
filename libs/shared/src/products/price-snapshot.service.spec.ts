import { PriceSnapshot } from './entities/price-snapshot.entity';
import { IPriceSnapshotRepository } from './repositories/interfaces/price-snapshot.interface';
import { PriceSnapshotService } from './price-snapshot.service';

describe('price-snapshot.service', () => {
  describe('findByProduct()', () => {
    it('pide el límite al repo y devuelve price+timestamp de más viejo a más nuevo', async () => {
      const older = PriceSnapshot.fromPersistence({
        id: crypto.randomUUID(),
        productId: 'p1',
        price: 120,
        timestamp: new Date('2026-01-01'),
      });
      const newer = PriceSnapshot.fromPersistence({
        id: crypto.randomUUID(),
        productId: 'p1',
        price: 100,
        timestamp: new Date('2026-01-02'),
      });
      const mockRepo: jest.Mocked<IPriceSnapshotRepository> = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findLatestPerProduct: jest.fn(),
        findByProduct: jest.fn().mockResolvedValue([newer, older]),
        update: jest.fn(),
        delete: jest.fn(),
      };
      const service = new PriceSnapshotService(mockRepo);

      const result = await service.findByProduct('p1', 200);

      expect(mockRepo.findByProduct).toHaveBeenCalledWith('p1', 200);
      expect(result).toEqual([
        { price: 120, timestamp: new Date('2026-01-01') },
        { price: 100, timestamp: new Date('2026-01-02') },
      ]);
    });
  });
});
