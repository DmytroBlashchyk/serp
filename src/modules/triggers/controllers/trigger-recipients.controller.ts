import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TriggerRecipientsService } from 'modules/triggers/services/trigger-recipients.service';
import { IdType } from 'modules/common/types/id-type.type';
import { SubscriptionChangeRequest } from 'modules/triggers/requests/subscription-change.request';

@Controller('trigger-recipients')
@ApiTags('Trigger recipients')
export class TriggerRecipientsController {
  constructor(
    private readonly triggerRecipientsService: TriggerRecipientsService,
  ) {}

  /**
   * Endpoint for handling subscription change requests.
   *
   * @param {SubscriptionChangeRequest} body - The body of the request containing subscription change details.
   * @return {Promise<void>} A promise that resolves when the subscription change process is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @Post('subscription-change')
  subscriptionChange(@Body() body: SubscriptionChangeRequest): Promise<void> {
    return this.triggerRecipientsService.subscriptionChange(body);
  }

  /**
   * Unsubscribes a recipient from receiving notifications.
   *
   * @param {IdType} triggerRecipientId - The ID of the recipient to unsubscribe.
   * @return {Promise<void>} A promise that resolves when the unsubscription is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @Post(':triggerRecipientId')
  unsubscribe(
    @Param('triggerRecipientId', new ParseIntPipe()) triggerRecipientId: IdType,
  ): Promise<void> {
    return this.triggerRecipientsService.unsubscribe(triggerRecipientId);
  }
}
