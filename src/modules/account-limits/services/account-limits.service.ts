import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';
import { AllLimitsOfCurrentAccountType } from 'modules/accounts/types/all-limits-of-current-account.type';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { TriggerRecipientEntity } from 'modules/triggers/entities/trigger-recipient.entity';

@Injectable()
export class AccountLimitsService {
  constructor(
    private readonly accountLimitRepository: AccountLimitRepository,
    private readonly gatewayService: GatewayService,
  ) {}

  /**
   * Updates the number of daily email alerts sent.
   *
   * This method interacts with the accountLimitRepository to update the count of daily email alerts sent for the account.
   *
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updatingNumberOfDailyEmailAlertsSent(): Promise<void> {
    await this.accountLimitRepository.updatingNumberOfDailyEmailAlertsSent();
  }

  /**
   * Limits the sending of email alerts based on the account's daily limit.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {TriggerRecipientEntity[]} recipients - The list of recipients to send alerts to.
   * @return {Promise<TriggerRecipientEntity[]>} A Promise that resolves to the list of recipients after limiting.
   */
  async limitingSendingOfEmailAlerts(
    accountId: IdType,
    recipients: TriggerRecipientEntity[],
  ): Promise<TriggerRecipientEntity[]> {
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const remainingDailyLimit = limits.find(
      (item) =>
        item.limit_types_name === LimitTypesEnum.NumberOfDailyAlertsSentByEmail,
    ).current_limit;

    if (recipients.length >= remainingDailyLimit) {
      recipients.splice(remainingDailyLimit);
    }

    await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      recipients.length,
      LimitTypesEnum.NumberOfDailyAlertsSentByEmail,
    );

    return recipients;
  }

  /**
   * Limits the number of new keyword updates for an account to its daily limit.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} numberOfKeywordsToBeAdded - The number of new keywords to be added.
   * @param {number} [offset] - Optional offset to calculate the effective limit based on keywords and offset.
   * @return {Promise<number>} - The adjusted number of keywords that can be added without exceeding the daily limit.
   */
  async limitNewKeywordUpdatesToADailyLimit(
    accountId: IdType,
    numberOfKeywordsToBeAdded: number,
    offset?: number,
  ): Promise<number> {
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const remainingDailyLimit = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
    ).current_limit;

    if (offset) {
      if (numberOfKeywordsToBeAdded * offset >= remainingDailyLimit) {
        numberOfKeywordsToBeAdded = Math.floor(remainingDailyLimit / offset);
      }
    } else {
      if (numberOfKeywordsToBeAdded >= remainingDailyLimit) {
        numberOfKeywordsToBeAdded = remainingDailyLimit;
      }
    }

    return numberOfKeywordsToBeAdded;
  }

  async limitLiveModeKeywordUpdatesToADailyLimit(
    accountId: IdType,
    keywords: KeywordEntity[],
  ): Promise<KeywordEntity[]> {
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const remainingDailyLimit = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfLiveModeUpdatesForKeywordsPerDay,
    ).current_limit;
    if (keywords.length >= remainingDailyLimit) {
      keywords.splice(remainingDailyLimit);
    }
    return keywords;
  }

  /**
   * Limits the number of keyword updates to a daily limit specified for the account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {KeywordEntity[]} keywords - The array of keyword entities to be updated.
   * @param {number} [offset] - Optional offset to be applied for calculating the limit.
   * @return {Promise<KeywordEntity[]>} - The array of keyword entities after applying the daily limit.
   */
  async limitKeywordUpdatesToADailyLimit(
    accountId: IdType,
    keywords: KeywordEntity[],
    offset?: number,
  ): Promise<KeywordEntity[]> {
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const remainingDailyLimit = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
    ).current_limit;
    if (offset) {
      if (keywords.length * offset >= remainingDailyLimit) {
        keywords.splice(Math.floor(remainingDailyLimit / offset));
      }
    } else {
      if (keywords.length >= remainingDailyLimit) {
        keywords.splice(remainingDailyLimit);
      }
    }

    return keywords;
  }

  /**
   * Fetches and returns the daily and monthly account limits for a given account.
   *
   * @param {IdType} accountId - The ID of the account for which to retrieve the limits.
   * @return {Promise<Object>} An object containing the number of keywords,
   *                           the daily update limit, and the monthly update limit.
   */
  async getDailyAndMonthlyAccountLimits(accountId: IdType) {
    const numberOfKeywords =
      await this.accountLimitRepository.getNumberOfAllKeywordsInAccount(
        accountId,
      );
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const balanceAccountLimitNumberOfDailyUpdatesOfKeywordPositions =
      limits.find(
        (item) =>
          item.limit_types_name ===
          LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
      ).current_limit;
    const balanceAccountLimitNumberOfMonthlyUpdatesOfKeywordPositions =
      limits.find(
        (item) =>
          item.limit_types_name ===
          LimitTypesEnum.NumberOfMonthlyUpdatesOfKeywordPositions,
      ).current_limit;
    return {
      numberOfKeywords,
      balanceAccountLimitNumberOfDailyUpdatesOfKeywordPositions,
      balanceAccountLimitNumberOfMonthlyUpdatesOfKeywordPositions,
    };
  }

  async takeIntoAccountQuotaOfLiveModeUpdatesPerDay(
    accountId: IdType,
    keywordCount: number,
  ): Promise<void> {
    await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      keywordCount,
      LimitTypesEnum.NumberOfLiveModeUpdatesForKeywordsPerDay,
    );
  }
  /**
   * Decreases the quota counters for daily and monthly keyword position updates
   * in the account after saving the results.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} keywordCount - The number of keywords that have been updated.
   * @return {Promise<void>} - A promise that resolves when the quota counters have been decremented.
   */
  async takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
    accountId: IdType,
    keywordCount: number,
  ): Promise<void> {
    await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      keywordCount,
      LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
    );
    await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      keywordCount,
      LimitTypesEnum.NumberOfMonthlyUpdatesOfKeywordPositions,
    );
  }

  /**
   * Checks if adding the specified number of tags to a keyword is within
   * the allowed limit for the given account.
   *
   * @param {IdType} accountId - The ID of the account to check limits for.
   * @param {number} numberOfTagsToAdd - The number of tags to be added to the keyword.
   * @return {Promise<void>} - A promise that resolves if adding the tags is allowed, otherwise it throws an exception.
   * @throws {BadRequestException} If the number of tags to add exceeds the allowed limit.
   */
  async checkAvailabilityOfAddingTagsToKeyword(
    accountId: IdType,
    numberOfTagsToAdd: number,
  ): Promise<void> {
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const allowedNumberOfProjectTags = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfAvailableTagsPerKeyword,
    ).default_limit;
    if (numberOfTagsToAdd > allowedNumberOfProjectTags) {
      throw new BadRequestException(
        `The limit of tags attached to a keyword exceeds the plan limit.`,
      );
    }
  }

  /**
   * Checks the availability of adding new tags to a project for a given account.
   *
   * @param {IdType} accountId - The ID of the account to check against project tag limits.
   * @param {number} numberOfTagsToAdd - The number of tags intended to be added to the project.
   * @return {Promise<void>} Resolves successfully if tags can be added; otherwise, throws an exception.
   */
  async checkAvailabilityOfAddingTagsToProject(
    accountId: IdType,
    numberOfTagsToAdd: number,
  ): Promise<void> {
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const allowedNumberOfProjectTags = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfAvailableTagsPerProject,
    ).default_limit;
    if (numberOfTagsToAdd > allowedNumberOfProjectTags) {
      throw new BadRequestException(
        `The limit of tags attached to the project has been exhausted`,
      );
    }
  }

  /**
   * Checks whether the total number of keywords in the account allows for adding more keywords.
   * Throws a BadRequestException if the number of keywords to be added exceeds the allowed limit.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} numberOfKeywordsToBeAdded - The number of keywords that need to be added to the account.
   * @return {Promise<void>} A promise that resolves if the number of keywords to be added does not exceed the allowed limit.
   * @throws {BadRequestException} If the number of keywords to be added exceeds the allowed limit.
   */
  async checkTotalNumberOfKeywordsInAccount(
    accountId: IdType,
    numberOfKeywordsToBeAdded: number,
  ): Promise<void> {
    const numberOfAccountKeywords =
      await this.accountLimitRepository.getNumberOfAllKeywordsInAccount(
        accountId,
      );
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const allowedNumberOfKeywords = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
    ).default_limit;

    const numberOfPossibleAdditions =
      allowedNumberOfKeywords - numberOfAccountKeywords;
    if (numberOfKeywordsToBeAdded > numberOfPossibleAdditions) {
      throw new BadRequestException(
        `You are allowed to add ${numberOfPossibleAdditions} keywords`,
      );
    }
  }

  /**
   * Resets the limits for deactivated subscriptions.
   *
   * This method interacts with the account limit repository to reset any limits
   * that are associated with deactivated subscriptions. It ensures that these limits
   * are cleared and ready to be reconfigured when the subscription is reactivated or replaced.
   *
   * @return {Promise<void>} A promise that resolves when the limits have been successfully reset.
   */
  async resetDeactivatedSubscriptionLimits(): Promise<void> {
    await this.accountLimitRepository.resetDeactivatedSubscriptionLimits();
  }
  /**
   * Updates the daily account limit by calling repository methods to update
   * the number of available keyword updates per day and live mode updates for keywords per day.
   *
   * @return {Promise<void>} A promise that resolves when the update operations are complete.
   */
  async updateDailyAccountLimit(): Promise<void> {
    await this.accountLimitRepository.updateNumberOfAvailableKeywordUpdatesPerDay();
    await this.accountLimitRepository.updateNumberOfLiveModeUpdatesForKeywordsPerDay();
  }

  /**
   * Handles the accounting for shared links by decreasing the remaining limit
   * and ensuring the account does not exceed its allocated number of shared links.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} numberOfChanges - The number of changes to be applied to the shared links limit.
   * @return {Promise<void>} A promise that resolves when the accounting process is complete.
   * @throws {BadRequestException} If the number of shared links exceeds the account's limit.
   */
  async accountingOfSharedLinks(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const result = await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      numberOfChanges,
      LimitTypesEnum.NumberOfSharedLinksAvailable,
    );
    if (!result) {
      throw new BadRequestException(
        'The number of shared link added exceeds the account limit.',
      );
    }

    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const accountLimitUsed =
      await this.accountLimitRepository.getNumberOfSharedLinksInAccount(
        accountId,
      );
    const balanceAccountLimit = limits.find(
      (item) =>
        item.limit_types_name === LimitTypesEnum.NumberOfSharedLinksAvailable,
    ).current_limit;
    await this.gatewayService.handleAdditionOfSharedLinks(
      accountId,
      accountLimitUsed,
      balanceAccountLimit,
    );
  }

  /**
   * Handles the accounting notes by decreasing the account's note limit and ensuring it does not exceed the allowed limit.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} numberOfChanges - The number of changes to be made to the account's notes.
   * @return {Promise<void>} - A promise that resolves when the operation completes.
   * @throws {BadRequestException} - Throws an exception if the number of notes added exceeds the account limit.
   */
  async accountingNotes(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const result = await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      numberOfChanges,
      LimitTypesEnum.NumberOfNotesAvailableForTheAccount,
    );
    if (!result) {
      throw new BadRequestException(
        'The number of notes added exceeds the account limit.',
      );
    }
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const accountLimitUsed =
      await this.accountLimitRepository.getACountOfAllNotesInAccount(accountId);
    const balanceAccountLimit = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfNotesAvailableForTheAccount,
    ).current_limit;
    await this.gatewayService.handleAdditionOfNotes(
      accountId,
      accountLimitUsed,
      balanceAccountLimit,
    );
  }

  /**
   * Handles the accounting of invitations for a specified account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} numberOfChanges - The number of changes to be reflected in the accounting.
   * @return {Promise<void>} A promise that resolves when the accounting process is complete.
   */
  async accountingOfInvitations(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const accountLimitUsed =
      await this.accountLimitRepository.getNumberOfAllInvitationsInAccount(
        accountId,
      );
    await this.gatewayService.handleAdditionOfInvitations(
      accountId,
      accountLimitUsed,
    );
  }

  /**
   * Handles the accounting and management of user limits for a given account.
   * Decreases the account user limit counter, checks if the number of users added exceeds the account limit,
   * and manages the addition of users within the account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} numberOfChanges - The number of user changes to be applied.
   * @return {Promise<void>} A promise that resolves when user accounting is successfully handled.
   * @throws {BadRequestException} If the number of users added exceeds the account limit.
   */
  async accountingOfUsers(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const result = await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      numberOfChanges,
      LimitTypesEnum.NumberOfUsersWhoHaveAccessToTheAccount,
    );
    if (!result) {
      throw new BadRequestException(
        'The number of users added exceeds the account limit.',
      );
    }
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const accountLimitUsed =
      await this.accountLimitRepository.getNumberOfAllUsersInAccount(accountId);
    const balanceAccountLimit = limits.find(
      (item) =>
        item.limit_types_name ===
        LimitTypesEnum.NumberOfUsersWhoHaveAccessToTheAccount,
    ).current_limit;
    await this.gatewayService.handleAdditionOfUsers(
      accountId,
      accountLimitUsed,
      balanceAccountLimit,
    );
  }

  /**
   * Manages the accounting of triggers for a given account by updating the trigger count,
   * checking account limits, and processing the addition of triggers.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} numberOfChanges - The number of triggers to be accounted for.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async accountingOfTriggers(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const result = await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      numberOfChanges,
      LimitTypesEnum.NumberOfTriggersAvailable,
    );
    if (!result) {
      throw new BadRequestException(
        'The number of triggers added exceeds the account limit.',
      );
    }

    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const accountLimitUsed =
      await this.accountLimitRepository.getNumberOfAllTriggersInAccount(
        accountId,
      );
    const balanceAccountLimit = limits.find(
      (item) =>
        item.limit_types_name === LimitTypesEnum.NumberOfTriggersAvailable,
    ).current_limit;
    await this.gatewayService.handleAdditionOfTriggers(
      accountId,
      accountLimitUsed,
      balanceAccountLimit,
    );
  }

  /**
   * Decreases the counter of available email reports for an account.
   * Ensures that the account has not exceeded its limit for the number of email reports.
   * Updates the gateway service with the new number of used and remaining email reports.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} numberOfChanges - The number of email reports to decrement.
   * @returns {Promise<void>} - A promise that resolves once the operation is complete.
   * @throws {BadRequestException} - If the number of email reports exceeds the account limit.
   */
  async accountingOfEmailReports(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const result = await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      numberOfChanges,
      LimitTypesEnum.NumberOfAvailableEmailReports,
    );
    if (!result) {
      throw new BadRequestException(
        'The number of recipients of email reports exceeds the account limit.',
      );
    }
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const accountLimitUsed =
      await this.accountLimitRepository.getNumberOfAllEmailsInAccount(
        accountId,
      );
    const balanceAccountLimit = limits.find(
      (item) =>
        item.limit_types_name === LimitTypesEnum.NumberOfAvailableEmailReports,
    ).current_limit;
    await this.gatewayService.handleAdditionOfEmailReports(
      accountId,
      accountLimitUsed,
      balanceAccountLimit,
    );
  }

  /**
   * Updates the account's competitor limit accounting by decreasing the limit counter
   * and checking if the new competitors can be added without exceeding the account limit.
   *
   * @param {IdType} accountId - The identifier of the account.
   * @param {number} numberOfChanges - The number of competitors being added or changed.
   * @return {Promise<void>} - A promise that resolves when the account competitor limit accounting is successfully updated.
   * @throws {BadRequestException} - If the number of competitors added exceeds the account limit.
   */
  async accountCompetitorLimitAccounting(
    accountId: IdType,
    numberOfChanges: number,
  ): Promise<void> {
    const result = await this.accountLimitRepository.limitDecreaseCounter(
      accountId,
      numberOfChanges,
      LimitTypesEnum.AvailableNumberOfCompetitors,
    );
    if (!result) {
      throw new BadRequestException(
        'The number of competitors added exceeds the account limit.',
      );
    }
    const limits = await this.accountLimitRepository.getAllAccountLimits(
      accountId,
    );
    const accountLimitUsed =
      await this.accountLimitRepository.getNumberOfAllCompetitorsInAccount(
        accountId,
      );
    const balanceAccountLimit = limits.find(
      (item) =>
        item.limit_types_name === LimitTypesEnum.AvailableNumberOfCompetitors,
    ).current_limit;
    await this.gatewayService.handleAdditionOfCompetitors(
      accountId,
      accountLimitUsed,
      balanceAccountLimit,
    );
  }

  /**
   * Retrieves all limit information for the current account.
   *
   * @param {IdType} accountId - The identifier for the account.
   * @param {IdType} userId - The identifier for the user.
   * @return {Promise<AllLimitsOfCurrentAccountType>} A promise that resolves to the limits information of the specified account.
   * @throws {NotFoundException} If no account limits are found.
   */
  async getAllLimitsOfCurrentAccount(
    accountId: IdType,
    userId: IdType,
  ): Promise<AllLimitsOfCurrentAccountType> {
    const limits =
      await this.accountLimitRepository.getAllLimitsOfCurrentAccount(
        accountId,
        userId,
      );
    if (limits.length === 0) {
      throw new NotFoundException('Account limits not found.');
    }
    return limits[0];
  }
}
