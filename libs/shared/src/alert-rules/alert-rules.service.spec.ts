import {
  PriceSnapshot,
  PriceSnapshotPersistenceInput,
  Product,
  ProductPersistenceInput,
} from '../products';
import { AlertRulesService } from './alert-rules.service';
import { AlertRule, AlertStateName } from './entities/alert-rule.entity';
import { IAlertRuleRepository } from './repositories/interfaces/alert-rule-repository.interface';

function makePersistenceInput(
  overrides: Partial<{
    id: string;
    productId: string;
    priceSnapshotId: string;
    state: AlertStateName;
    lastNotifiedPrice: number | null;
    lastNotifiedAt: Date | null;
    createdAt: Date;
  }> = {},
) {
  return {
    id: crypto.randomUUID(),
    productId: crypto.randomUUID(),
    priceSnapshotId: crypto.randomUUID(),
    state: 'threshold_crossed' as AlertStateName,
    lastNotifiedPrice: null,
    lastNotifiedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeProductPersistenceInput(
  overrides: Partial<ProductPersistenceInput> = {},
): ProductPersistenceInput {
  return {
    id: crypto.randomUUID(),
    highestPrice: 500,
    name: 'Nuevo producto',
    site: 'megatone',
    url: 'https://megatone.com/products/123_NUEVO',
    ...overrides,
  };
}

function makePriceSnapshotPersistenceInput(
  overrides: Partial<PriceSnapshotPersistenceInput> = {},
): PriceSnapshotPersistenceInput {
  return {
    id: crypto.randomUUID(),
    productId: crypto.randomUUID(),
    price: 500,
    timestamp: new Date(),
    ...overrides,
  };
}

describe('alert-rules.service', () => {
  describe('findById()', () => {
    it('busca la alerta correctamente', async () => {
      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findById: jest
          .fn()
          .mockResolvedValue(
            AlertRule.fromPersistence(makePersistenceInput({ id: 'id-123' })),
          ),
        create: jest.fn(),
        delete: jest.fn(),
        findActiveByProduct: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };
      const alertRuleService = new AlertRulesService(mockRepo);
      const alert = await alertRuleService.findById('id-123');
      expect(alert.id).toBe('id-123');
    });

    it('lanza un error si la alerta no se encuentra', async () => {
      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findById: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        delete: jest.fn(),
        findActiveByProduct: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };
      const alertRuleService = new AlertRulesService(mockRepo);
      await expect(alertRuleService.findById('id-123')).rejects.toThrow(
        'No existe una alerta con el ID id-123',
      );
    });
  });

  describe('update()', () => {
    it('delega en el método update del repositorio', async () => {
      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findById: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findActiveByProduct: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };
      const alertRuleService = new AlertRulesService(mockRepo);
      const alert = AlertRule.fromPersistence(makePersistenceInput());
      await alertRuleService.update(alert);
      expect(mockRepo.update).toHaveBeenCalledWith(alert, undefined);
    });
  });

  describe('handleEvaluationPrice()', () => {
    it('precio no bajo y sin alerta activa retorna null', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        false,
      );
      expect(alert).toBeNull();
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('precio no bajo con alerta en threshold_crossed retorna null', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        false,
      );
      expect(alert).toBeNull();
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('precio no bajo con alerta notificada la resuelve y retorna null', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );
      const alert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'notified',
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(alert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const evaluated = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        false,
      );
      expect(evaluated).toBeNull();
      expect(alert.state).toBe('resolved');
      expect(mockRepo.update).toHaveBeenCalledWith(alert, undefined);
    });

    it('precio no bajo con alerta resuelta retorna null', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'resolved',
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        false,
      );
      expect(alert).toBeNull();
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('precio bajo y sin alerta activa crea y persiste la alerta', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(
          AlertRule.fromPersistence(
            makePersistenceInput({
              productId: product.id,
              priceSnapshotId: snapshot.id,
            }),
          ),
        ),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        true,
      );
      expect(alert?.productId).toBe(product.id);
      expect(alert?.priceSnapshotId).toBe(snapshot.id);
      expect(alert?.state).toBe('threshold_crossed');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'threshold_crossed',
        }),
        undefined,
      );
    });

    it('precio bajo con alerta en threshold_crossed retorna la activa sin persistir', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        true,
      );
      expect(alert?.id).toBe(activeAlert.id);
      expect(alert?.state).toBe('threshold_crossed');
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('alerta notificada y el precio mejoró, renotifica', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 50 }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'notified',
          lastNotifiedPrice: 80,
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        update: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        true,
      );
      expect(alert).toMatchObject({
        id: activeAlert.id,
        productId: product.id,
        priceSnapshotId: snapshot.id,
        state: 'threshold_crossed',
      });
      expect(mockRepo.update).toHaveBeenCalledWith(activeAlert, undefined);
    });

    it('alerta notificada, no mejoró pero expiró, renotifica', async () => {
      const twentyFiveHoursInMiliseconds = 1000 * 60 * 60 * 25;
      const expiredAt = new Date(Date.now() - twentyFiveHoursInMiliseconds);

      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({
          productId: product.id,
          price: 50,
          timestamp: expiredAt,
        }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'notified',
          lastNotifiedAt: snapshot.timestamp,
          lastNotifiedPrice: snapshot.price,
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        update: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        true,
      );
      expect(alert).toMatchObject({
        id: activeAlert.id,
        productId: product.id,
        priceSnapshotId: snapshot.id,
        state: 'threshold_crossed',
      });
      expect(mockRepo.update).toHaveBeenCalledWith(activeAlert, undefined);
    });

    it('alerta notificada, no mejoró y no expiró, retorna null', async () => {
      const sixHoursInMiliseconds = 1000 * 60 * 60 * 6;
      const recent = new Date(Date.now() - sixHoursInMiliseconds);

      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({
          productId: product.id,
          price: 50,
          timestamp: recent,
        }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'notified',
          lastNotifiedPrice: 50,
          lastNotifiedAt: snapshot.timestamp,
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        update: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        true,
      );
      expect(alert).toBeNull();
      expect(activeAlert.state).toBe('notified');
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('alerta notificada sin datos de notificación retorna null sin error', async () => {
      const product = Product.fromPersistence(makeProductPersistenceInput());
      const snapshot = PriceSnapshot.fromPersistence(
        makePriceSnapshotPersistenceInput({ productId: product.id, price: 10 }),
      );
      const activeAlert = AlertRule.fromPersistence(
        makePersistenceInput({
          productId: product.id,
          priceSnapshotId: snapshot.id,
          state: 'notified',
          lastNotifiedPrice: null,
          lastNotifiedAt: null,
        }),
      );

      const mockRepo: jest.Mocked<IAlertRuleRepository> = {
        findActiveByProduct: jest.fn().mockResolvedValue(activeAlert),
        create: jest.fn(),
        findById: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
      };

      const alertRuleService = new AlertRulesService(mockRepo);

      const alert = await alertRuleService.handleEvaluationPrice(
        product,
        snapshot,
        true,
      );
      expect(alert).toBeNull();
      expect(activeAlert.state).toBe('notified');
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
