import { IsString } from 'class-validator';

export class RestoreACanceledSubscriptionRequest {
  @IsString()
  subscriptionId: string;
}
