import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { BaseEnv } from '@app/shared/config';
import { TelegramNotifierService } from './telegram-notifier.service';

describe('telegram-notifier.service', () => {
  describe('sendPriceDrop()', () => {
    it('envía el mensaje a Telegram con el chat_id y el texto', async () => {
      const mockHttp = {
        post: jest.fn().mockReturnValue(of({ data: { ok: true } })),
      } as unknown as HttpService;
      const mockConfig = {
        get: jest.fn((key: string) =>
          key === 'TELEGRAM_BOT_TOKEN' ? 'test-token' : 'test-chat',
        ),
      } as unknown as ConfigService<BaseEnv>;
      const service = new TelegramNotifierService(mockHttp, mockConfig);

      await service.sendPriceDrop({
        productName: 'Producto X',
        price: 100,
        url: 'https://megatone.com/producto-x',
      });

      expect(mockHttp.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-token/sendMessage',
        {
          chat_id: 'test-chat',
          text: '📉 Producto X\nPrecio: $100\nhttps://megatone.com/producto-x',
        },
      );
    });

    it('lanza un error si Telegram responde con ok: false', async () => {
      const mockHttp = {
        post: jest
          .fn()
          .mockReturnValue(
            of({ data: { ok: false, description: 'Unauthorized' } }),
          ),
      } as unknown as HttpService;
      const mockConfig = {
        get: jest.fn((key: string) =>
          key === 'TELEGRAM_BOT_TOKEN' ? 'test-token' : 'test-chat',
        ),
      } as unknown as ConfigService<BaseEnv>;
      const service = new TelegramNotifierService(mockHttp, mockConfig);

      await expect(
        service.sendPriceDrop({
          productName: 'Producto X',
          price: 100,
          url: 'https://megatone.com/producto-x',
        }),
      ).rejects.toThrow('Telegram respondió con error: Unauthorized');
    });
  });
});
