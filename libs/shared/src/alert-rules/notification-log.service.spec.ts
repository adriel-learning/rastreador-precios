import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogService } from './notification-log.service';
import { INotificationLogRepository } from './repositories/interfaces/notification-log-repository.interface';

function makeLog(
  overrides: Partial<{ alertId: string; triggerPrice: number }> = {},
) {
  return NotificationLog.create({
    alertId: crypto.randomUUID(),
    triggerPrice: 150,
    ...overrides,
  });
}

describe('notification-log.service', () => {
  describe('create()', () => {
    it('llama repo.create con el log y devuelve el log creado', async () => {
      const inputLog = makeLog();
      const createdLog = makeLog();
      const mockRepo: jest.Mocked<INotificationLogRepository> = {
        create: jest.fn().mockResolvedValue(createdLog),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
      const service = new NotificationLogService(mockRepo);

      const result = await service.create(inputLog);

      expect(mockRepo.create).toHaveBeenCalledWith(inputLog, undefined);
      expect(result).toBe(createdLog);
    });
  });
});
