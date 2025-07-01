import { PostmarkWebhookType } from 'modules/mailing/enums/postmark-webhook-type.enum';

export class HandleEmailReportBounceWebhookEvent {
  readonly email: string;
  readonly recordType: PostmarkWebhookType;

  constructor(date: HandleEmailReportBounceWebhookEvent) {
    Object.assign(this, date);
  }
}
