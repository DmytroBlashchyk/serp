import { EventTypeEnum } from 'modules/payments/enums/event-type.enum';

export class HandlePaddleWebhookType {
  data: any;
  event_id: string;
  event_type: EventTypeEnum;
  occurred_at: Date;
  notification_id: string;
}
