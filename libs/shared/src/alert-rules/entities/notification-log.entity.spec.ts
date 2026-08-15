import { NotificationLog } from './notification-log.entity';

function makeInput(
  overrides: Partial<{
    alertId: string;
    triggerPrice: number;
    timestamp: Date;
  }> = {},
) {
  return {
    alertId: crypto.randomUUID(),
    triggerPrice: 150,
    ...overrides,
  };
}

describe('Notification-log', () => {
  describe('create()', () => {
    it('Crea un log con id, alertId y triggerPrice', () => {
      const input = makeInput();
      const log = NotificationLog.create(input);

      expect(log).toMatchObject({
        alertId: input.alertId,
        triggerPrice: 150,
      });
      expect(typeof log.id).toBe('string');
      expect(log.timestamp).toBeInstanceOf(Date);
    });

    it('Timestamp por defecto es la fecha actual', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

      const log = NotificationLog.create(makeInput());

      expect(log.timestamp).toEqual(new Date('2024-01-01T00:00:00Z'));

      jest.useRealTimers();
    });

    it('Respeta el timestamp provisto', () => {
      const timestamp = new Date('2023-06-15T12:00:00Z');
      const log = NotificationLog.create(makeInput({ timestamp }));

      expect(log.timestamp).toEqual(timestamp);
    });
  });

  describe('fromPersistence()', () => {
    it('Restaura los campos persistidos', () => {
      const timestamp = new Date('2023-06-15T12:00:00Z');
      const id = crypto.randomUUID();
      const input = { ...makeInput(), id, timestamp };
      const log = NotificationLog.fromPersistence(input);

      expect(log).toMatchObject({
        id,
        alertId: input.alertId,
        triggerPrice: 150,
        timestamp,
      });
    });
  });
});
