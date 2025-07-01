import { PostmarkWebhookType } from 'modules/mailing/enums/postmark-webhook-type.enum';

export class HandleEmailReportBounceWebhookCommand {
  constructor(
    public readonly email: string,
    public readonly recordType: PostmarkWebhookType,
  ) {}
}
