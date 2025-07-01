import { BounceTypeEnum } from 'modules/mailing/enums/bounce-type.enum';
import { PostmarkWebhookType } from 'modules/mailing/enums/postmark-webhook-type.enum';

export interface PaddleBounceWebhookType {
  ID: number;
  Type: PostmarkWebhookType;
  RecordType: string;
  TypeCode: BounceTypeEnum;
  Tag: string;
  MessageID: string;
  Details: string;
  Email: string;
  From: string;
  BouncedAt: string;
  Inactive: boolean;
  DumpAvailable: boolean;
  CanActivate: boolean;
  Subject: string;
  ServerID: number;
  MessageStream: string;
  Content: string;
  Name: string;
  Description: string;
  Metadata: Record<string, unknown>;
}
