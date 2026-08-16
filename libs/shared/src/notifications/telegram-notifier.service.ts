import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BaseEnv } from '@app/shared/config';
import { PriceDropNotification } from './schemas/price-drop-notification.schema';
import { TelegramSendResponse } from './responses/telegram-send.response';
import { TELEGRAM_API } from './constants/telegram.constants';

@Injectable()
export class TelegramNotifierService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<BaseEnv>,
  ) {}

  async sendPriceDrop(notification: PriceDropNotification): Promise<void> {
    const token = this.config.get('TELEGRAM_BOT_TOKEN', { infer: true });
    const chatId = this.config.get('TELEGRAM_CHAT_ID', { infer: true });

    const text = [
      `📉 ${notification.productName}`,
      `Precio: $${notification.price}`,
      notification.url,
    ].join('\n');

    const response = await firstValueFrom(
      this.http.post<TelegramSendResponse>(
        `${TELEGRAM_API}/bot${token}/sendMessage`,
        {
          chat_id: chatId,
          text,
        },
      ),
    );

    if (!response.data.ok) {
      throw new Error(
        `Telegram respondió con error: ${response.data.description}`,
      );
    }
  }
}
