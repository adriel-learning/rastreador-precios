import { Logger } from 'nestjs-pino';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationLogService } from './notification-log.service';
import { INotificationLogRepository } from './repositories/interfaces/notification-log-repository.interface';

function makeLog(overrides: Partial<{ alertId: string; triggerPrice: number }> = {}) {
  return NotificationLog.create({
    alertId: crypto.randomUUID(),
    triggerPrice: 150,
    ...overrides,
  });
}

describe('notification-log.service', () => {
  describe('createAndLog()', () => {
    it('llama repo.create con el log y loguea la baja con los datos devueltos', async () => {
      const inputLog = makeLog();
      const createdLog = makeLog();
      const mockRepo: jest.Mocked<INotificationLogRepository> = {
        create: jest.fn().mockResolvedValue(createdLog),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
      const mockLogger = { log: jest.fn() } as unknown as Logger;
      const service = new NotificationLogService(mockRepo, mockLogger);

      await service.createAndLog(inputLog, 'Nuevo producto');

      expect(mockRepo.create).toHaveBeenCalledWith(inputLog);
      expect(mockLogger.log).toHaveBeenCalledWith(
        { alertId: createdLog.alertId, triggerPrice: createdLog.triggerPrice },
        'El producto Nuevo producto tuvo una baja de precio',
      );
    });
  });
});