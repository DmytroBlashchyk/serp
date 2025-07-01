import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TariffPlansResponse } from 'modules/subscriptions/responses/tariff-plans.response';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { SubscriptionsService } from 'modules/subscriptions/services/subscriptions.service';
import { UpdatePaymentMethodResponse } from 'modules/subscriptions/responses/update-payment-method.response';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { BillingResponse } from 'modules/subscriptions/responses/billing.response';
import { GetTariffPlanRequest } from 'modules/subscriptions/requests/get-tariff-plan.request';
import { UnsubscriptionRequest } from 'modules/subscriptions/requests/unsubscription.request';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { UpdateReviewRequest } from 'modules/subscriptions/requests/update-review.request';
import { UpdateReviewResponse } from 'modules/subscriptions/responses/update-review.response';
import { SubscriptionUpdateRequest } from 'modules/subscriptions/requests/subscription-update.request';

@ApiTags('Subscriptions')
@Controller('accounts')
export class SubscriptionsController {
  constructor(
    private readonly tariffPlansService: TariffPlansService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}
  /**
   * Retrieves the tariff plans based on the provided query parameters.
   *
   * @param {GetTariffPlanRequest} query - The request query parameters including type and accountId.
   * @return {Promise<TariffPlansResponse>} - A promise that resolves to the tariff plans response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: TariffPlansResponse })
  @Get('subscriptions/tariff-plans')
  async plans(
    @Query() query: GetTariffPlanRequest,
  ): Promise<TariffPlansResponse> {
    return this.tariffPlansService.getTariffPlans(query.type, query.accountId);
  }

  /**
   * Updates the payment method for a subscription.
   *
   * @param {IdType} id - The ID of the subscription for which the payment method is being updated.
   * @return {Promise<UpdatePaymentMethodResponse>} A promise that resolves to the response containing the updated payment method.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: UpdatePaymentMethodResponse })
  @Post(':id/subscriptions/update-payment-method')
  async updatePaymentMethod(
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<UpdatePaymentMethodResponse> {
    return this.subscriptionsService.updatePaymentMethod(id);
  }

  /**
   * Handles the billing process for a subscription based on the provided ID.
   *
   * @param {number} id - The unique identifier of the subscription.
   * @return {Promise<BillingResponse>} A promise that resolves to the billing response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Get(':id/billing')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @ApiOkResponse({ type: BillingResponse })
  billing(
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<BillingResponse> {
    return this.subscriptionsService.billing(id);
  }

  /**
   * Handles the unsubscription of a user from a service based on the given account ID and unsubscription request body.
   *
   * @param {number} id - The account ID of the user who wishes to unsubscribe.
   * @param {UnsubscriptionRequest} body - The detailed unsubscription request containing necessary information for processing.
   * @return {Promise<void>} A promise that resolves when the unsubscription process is completed.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Post(':id/subscriptions/unsubscription')
  @UserAuth(RoleEnum.Admin)
  unsubscription(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: UnsubscriptionRequest,
  ): Promise<void> {
    return this.subscriptionsService.unsubscription({ ...body, accountId: id });
  }

  /**
   * Restores a canceled subscription for a given account ID.
   *
   * @param {number} id - The unique identifier of the account.
   * @return {Promise<void>} A promise that resolves once the subscription has been successfully restored.
   */
  @ApiOkResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin)
  @Post(':id/subscriptions/restore-a-canceled-subscription')
  restoreACanceledSubscription(
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<void> {
    return this.subscriptionsService.restoreACanceledSubscription({
      accountId: id,
    });
  }

  /**
   * Updates the review for a subscription.
   *
   * @param {UpdateReviewRequest} body - The details of the review to be updated.
   * @param {IdType} id - The identifier of the subscription for which the review is being updated.
   * @return {Promise<UpdateReviewResponse | void>} A promise that resolves with the updated review response, or void if the operation fails.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: UpdateReviewResponse })
  @UserAuth(RoleEnum.Admin)
  @Patch(':id/subscriptions/update-review')
  updateReview(
    @Body() body: UpdateReviewRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<UpdateReviewResponse | void> {
    return this.subscriptionsService.updateReview({ ...body, accountId: id });
  }

  /**
   * Updates a subscription with the given ID based on the provided update request.
   *
   * @param {SubscriptionUpdateRequest} body - The update request containing the new subscription details.
   * @param {IdType} id - The unique identifier of the subscription to be updated.
   * @return {Promise<void>} A promise that resolves when the subscription is successfully updated.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin)
  @Patch(':id/subscriptions/update')
  update(
    @Body() body: SubscriptionUpdateRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<void> {
    return this.subscriptionsService.updateSubscription({
      ...body,
      accountId: id,
    });
  }
}
