import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AllLimitsOfCurrentAccountType } from 'modules/accounts/types/all-limits-of-current-account.type';
import { NecessaryRemovalResponse } from 'modules/accounts/responses/necessary-removal.response';
import { Injectable } from '@nestjs/common';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';

@Injectable()
export class NecessaryRemovalResponseFactory extends BaseResponseFactory<
  AllLimitsOfCurrentAccountType,
  NecessaryRemovalResponse
> {
  /**
   * Creates a response detailing the necessary removals required to comply with the default tariff plan limits.
   *
   * @param {AllLimitsOfCurrentAccountType} entity - The current account entity containing various count metrics.
   * @param {Record<string, unknown>} [options] - Optional settings including planLimits which is an array of DefaultTariffPlanLimitEntity.
   * @return {Promise<NecessaryRemovalResponse>} A promise that resolves to a NecessaryRemovalResponse object containing the necessary removals.
   */
  async createResponse(
    entity: AllLimitsOfCurrentAccountType,
    options?: Record<string, unknown>,
  ): Promise<NecessaryRemovalResponse> {
    const planLimits = options.planLimits as DefaultTariffPlanLimitEntity[];
    const numberOfDailyUpdatesOfKeywordPositionsDefaultLimit =
      planLimits.find(
        (limit) =>
          limit.limitType.name ==
          LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
      )?.limit ?? 0;
    const numberOfNotesAvailableForTheAccountDefaultLimit =
      planLimits.find(
        (limit) =>
          limit.limitType.name ===
          LimitTypesEnum.NumberOfNotesAvailableForTheAccount,
      )?.limit ?? 0;
    const numberOfAvailableEmailReportsDefaultLimit =
      planLimits.find(
        (limit) =>
          limit.limitType.name === LimitTypesEnum.NumberOfAvailableEmailReports,
      )?.limit ?? 0;

    const numberOfTriggersAvailableDefaultLimit =
      planLimits.find(
        (limit) =>
          limit.limitType.name === LimitTypesEnum.NumberOfTriggersAvailable,
      )?.limit ?? 0;
    let numberOfKeywords = 0;
    let numberOfNotes = 0;
    let numberOfEmailReports = 0;
    let numberOfTriggers = 0;
    if (entity.note_count > numberOfNotesAvailableForTheAccountDefaultLimit) {
      numberOfNotes =
        entity.note_count -
        Number(numberOfNotesAvailableForTheAccountDefaultLimit);
    }
    if (
      entity.keyword_count > numberOfDailyUpdatesOfKeywordPositionsDefaultLimit
    ) {
      numberOfKeywords =
        entity.keyword_count -
        Number(numberOfDailyUpdatesOfKeywordPositionsDefaultLimit);
    }
    if (entity.email_report_count > numberOfAvailableEmailReportsDefaultLimit) {
      numberOfEmailReports =
        entity.email_report_count -
        Number(numberOfAvailableEmailReportsDefaultLimit);
    }
    if (entity.trigger_count > numberOfTriggersAvailableDefaultLimit) {
      numberOfTriggers =
        entity.trigger_count - Number(numberOfTriggersAvailableDefaultLimit);
    }
    return new NecessaryRemovalResponse({
      numberOfKeywords,
      numberOfNotes,
      numberOfEmailReports,
      numberOfTriggers,
    });
  }
}
