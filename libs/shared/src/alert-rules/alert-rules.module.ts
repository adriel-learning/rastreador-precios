import { Module } from '@nestjs/common';
import { DbModule } from '../db';
import { IAlertRuleRepository } from './repositories/interfaces/alert-rule-repository.interface';
import { AlertRuleRepository } from './repositories/alert-rule.repository';
import { AlertRulesService } from './alert-rules.service';
import { NotificationLogService } from './notification-log.service';
import { INotificationLogRepository } from './repositories/interfaces/notification-log-repository.interface';
import { NotificationLogRepository } from './repositories/notification-log.repository';

@Module({
  imports: [DbModule],
  providers: [
    {
      provide: IAlertRuleRepository,
      useClass: AlertRuleRepository,
    },
    {
      provide: INotificationLogRepository,
      useClass: NotificationLogRepository,
    },
    AlertRulesService,
    NotificationLogService,
  ],
  exports: [
    AlertRulesService,
    NotificationLogService,
    IAlertRuleRepository,
    INotificationLogRepository,
  ],
})
export class AlertRulesModule {}
