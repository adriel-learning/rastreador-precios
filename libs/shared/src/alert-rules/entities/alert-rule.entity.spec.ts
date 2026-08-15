import { AlertRule, type AlertStateName } from './alert-rule.entity';

function makeCreatedAlert() {
  const productId = crypto.randomUUID();
  const priceSnapshotId = crypto.randomUUID();
  const alert = AlertRule.create({ productId, priceSnapshotId });
  return { alert, productId, priceSnapshotId };
}

function makeNotifiedAlert(price = 200) {
  const { alert } = makeCreatedAlert();
  alert.notify(price, new Date());
  return alert;
}

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

describe('Alert-rule', () => {
  describe('create()', () => {
    it('Alerta en estado inicial', () => {
      const priceSnapshotId = crypto.randomUUID();
      const productId = crypto.randomUUID();
      const alert = AlertRule.create({ priceSnapshotId, productId });

      expect(alert).toMatchObject({
        state: 'threshold_crossed',
        lastNotifiedPrice: null,
        lastNotifiedAt: null,
        productId,
        priceSnapshotId,
      });
      expect(typeof alert.id).toBe('string');
      expect(alert.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('fromPersistence()', () => {
    it('Restaura una alerta en threshold_crossed', () => {
      const input = makePersistenceInput();
      const alert = AlertRule.fromPersistence(input);

      expect(alert).toMatchObject({
        id: input.id,
        productId: input.productId,
        priceSnapshotId: input.priceSnapshotId,
        state: 'threshold_crossed',
        lastNotifiedPrice: null,
        lastNotifiedAt: null,
        createdAt: input.createdAt,
      });
    });

    it('Restaura una alerta notificada', () => {
      const lastNotifiedAt = new Date();
      const input = makePersistenceInput({
        state: 'notified',
        lastNotifiedPrice: 150,
        lastNotifiedAt,
      });
      const alert = AlertRule.fromPersistence(input);

      expect(alert).toMatchObject({
        id: input.id,
        productId: input.productId,
        priceSnapshotId: input.priceSnapshotId,
        state: 'notified',
        lastNotifiedPrice: 150,
        lastNotifiedAt,
        createdAt: input.createdAt,
      });
    });

    it('Restaura una alerta resuelta', () => {
      const input = makePersistenceInput({ state: 'resolved' });
      const alert = AlertRule.fromPersistence(input);

      expect(alert).toMatchObject({
        id: input.id,
        productId: input.productId,
        priceSnapshotId: input.priceSnapshotId,
        state: 'resolved',
        lastNotifiedPrice: null,
        lastNotifiedAt: null,
        createdAt: input.createdAt,
      });
    });

    it('La alerta restaurada mantiene su comportamiento', () => {
      const crossed = AlertRule.fromPersistence(makePersistenceInput());
      crossed.notify(100, new Date());
      expect(crossed.state).toBe('notified');

      const notified = AlertRule.fromPersistence(
        makePersistenceInput({
          state: 'notified',
          lastNotifiedPrice: 150,
          lastNotifiedAt: new Date(),
        }),
      );
      notified.reCross();
      expect(notified.state).toBe('threshold_crossed');

      notified.notify(120, new Date());
      notified.resolve();
      expect(notified.state).toBe('resolved');
    });
  });

  describe('notify()', () => {
    it('Alerta notifica correctamente', () => {
      const { alert, productId, priceSnapshotId } = makeCreatedAlert();
      const dateNotified = new Date();

      alert.notify(200, dateNotified);
      expect(alert).toMatchObject({
        state: 'notified',
        lastNotifiedPrice: 200,
        lastNotifiedAt: dateNotified,
        productId,
        priceSnapshotId,
      });
      expect(typeof alert.id).toBe('string');
      expect(alert.createdAt).toBeInstanceOf(Date);
    });

    it('No se puede notificar desde notified', () => {
      const { alert } = makeCreatedAlert();

      alert.notify(200, new Date());
      expect(() => alert.notify(200, new Date())).toThrow(
        `No se puede notificar desde notified`,
      );
      expect(alert.state).toBe('notified');
    });

    it('No se puede notificar desde resolved', () => {
      const { alert } = makeCreatedAlert();

      alert.notify(200, new Date());
      alert.resolve();
      expect(() => alert.notify(200, new Date())).toThrow(
        `No se puede notificar desde resolved`,
      );
    });
  });

  describe('resolve()', () => {
    it('La alerta se resuelve después de ser notificada', () => {
      const { alert } = makeCreatedAlert();

      alert.notify(200, new Date());
      alert.resolve();
      expect(alert.state).toBe('resolved');
    });

    it('Una alerta no notificada no puede resolverse', () => {
      const { alert } = makeCreatedAlert();

      expect(() => alert.resolve()).toThrow(
        `La alerta no se puede resolver desde el estado threshold_crossed`,
      );
    });

    it('Una alerta ya resuelta no se puede resolver', () => {
      const { alert } = makeCreatedAlert();

      alert.notify(200, new Date());
      alert.resolve();
      expect(() => alert.resolve()).toThrow(
        `La alerta no se puede resolver desde el estado resolved`,
      );
    });
  });

  describe('reCross()', () => {
    it('Alerta se renotifica correctamente', () => {
      const { alert } = makeCreatedAlert();

      alert.notify(200, new Date());
      alert.reCross();
      expect(alert.state).toBe('threshold_crossed');
    });

    it('Alerta no notificada no se puede renotificar', () => {
      const { alert } = makeCreatedAlert();

      expect(() => alert.reCross()).toThrow(
        `La alerta no se puede renotificar desde el estado threshold_crossed`,
      );
    });

    it('Alerta resuelta no se puede renotificar', () => {
      const { alert } = makeCreatedAlert();

      alert.notify(200, new Date());
      alert.resolve();
      expect(() => alert.reCross()).toThrow(
        `La alerta no se puede renotificar desde el estado resolved`,
      );
    });
  });

  describe('canReCross()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('Una alerta nunca notificada no puede re-crossear', () => {
      const { alert } = makeCreatedAlert();

      expect(alert.canReCross()).toBeNull();
    });

    it('Una notificación reciente no expira', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const alert = makeNotifiedAlert();

      jest.setSystemTime(new Date('2024-01-01T01:00:00Z'));

      expect(alert.canReCross()).toBe(false);
    });

    it('Una notificación de hace más de 24h expira', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const alert = makeNotifiedAlert();

      jest.setSystemTime(new Date('2024-01-02T01:00:00Z'));

      expect(alert.canReCross()).toBe(true);
    });
  });
});
