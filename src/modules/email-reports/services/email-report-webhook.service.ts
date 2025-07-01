import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { HandleEmailReportBounceWebhookEvent } from 'modules/email-reports/events/handle-email-report-bounce-webhook.event';
import { PaddleBounceWebhookType } from 'modules/email-reports/types/paddle-bounce-webhook.type';

@Injectable()
export class EmailReportWebhookService {
  constructor(private readonly eventBus: EventBus) {}

  public async handlePaddleBounceEmail(
    payload: PaddleBounceWebhookType,
  ): Promise<void> {
    this.eventBus.publish(
      new HandleEmailReportBounceWebhookEvent({
        email: payload.Email,
        recordType: payload.RecordType as any,
      }),
    );
  }
}
