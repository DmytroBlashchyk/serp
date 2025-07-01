import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { SubscriptionsService } from 'modules/subscriptions/services/subscriptions.service';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { LocationsJobEmitter } from 'modules/countries/job-emmiters/locations.job-emitter';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly keywordsService: KeywordsService,
    private readonly emailReportsService: EmailReportsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly projectsService: ProjectsService,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly locationsJobEmitter: LocationsJobEmitter,
  ) {}

  /**
   * A scheduled method to inform users about the impending deletion of their account.
   * This method runs daily at midnight.
   *
   * @return {Promise<void>} A promise that resolves when the notification process is completed.
   */
  @Cron('0 0 0 * * *')
  async toInformAboutImpendingDeletionOfAccount(): Promise<void> {
    await this.accountsService.sendingEmailsAboutDeletingAnAccount();
    this.logger.debug('Called, every day at 00:00 a.m.');
  }

  /**
   * Cron job scheduled to run at 01:00 AM daily.
   * This method checks for new locations and triggers an event
   * to add these new locations for Google Search Engine Results Pages (SERP).
   *
   * @return {Promise<void>} A promise that resolves when the locations
   *         job emitter has finished emitting the event for adding new locations.
   */
  // @Cron('0 0 0 1 * *')
  // async checkForNewLocationsForGoogle() {
  //   await this.locationsJobEmitter.emitAddNewLocationsForGoogleSERP();
  // }

  /**
   * This method is a scheduled cron job that is triggered at 00:10 on the first day of every month.
   * It initiates the process to add new keyword data locations for Google by emitting a related event.
   *
   * @return {Promise<void>} A promise that resolves once the event is successfully emitted.
   */
  // @Cron('0 10 1 * *')
  // async checkForNewLocationsForKeywordDataGoogle() {
  //   await this.locationsJobEmitter.emitAddNewKeywordDataLocationsForGoogle();
  // }

  /**
   * Scheduled cron job set to run at 12:20 AM on the 1st of every month.
   * Triggers the process to add new locations for Bing's search engine results page (SERP).
   *
   * @return {Promise<void>} A promise that resolves when the job has been emitted.
   */
  // @Cron('0 20 1 * *')
  // async checkForNewLocationsForBingSERP() {
  //   await this.locationsJobEmitter.emitAddNewLocationsForBingSERP();
  // }

  /**
   * This method is scheduled to run as a cron job at 01:30 AM daily. It triggers an event to
   * add new keyword data for Bing locations by calling the `emitAddNewKeywordDataLocationsForBing`
   * method from the `locationsJobEmitter` instance.
   *
   * @return {Promise<void>} A promise that resolves when the job is successfully triggered.
   */
  // @Cron('0 20 2 * *')
  // async checkForNewLocationsForKeywordDataBing() {
  //   await this.locationsJobEmitter.emitAddNewKeywordDataLocationsForBing();
  // }

  /**
   * Scheduled method that checks for new locations for YouTube SERP.
   * This method is executed as per the defined cron schedule, and it triggers
   * the emission of an event to add new locations for YouTube SERP.
   *
   * @return {Promise<void>} A promise that resolves when the process is complete.
   */
  // @Cron('0 20 3 * *')
  // async checkForNewLocationsForYoutubeSERP() {
  //   await this.locationsJobEmitter.emitAddNewLocationsForYoutubeSERP();
  // }

  /**
   * Scheduled task to check for and add new locations in Yahoo SERP.
   * Runs at 1:00 AM every day.
   *
   * @return {Promise<void>} A promise that resolves when the task is complete.
   */
  // @Cron('0 20 4 * *')
  // async checkForNewLocationsForYahooSERP() {
  //   await this.locationsJobEmitter.emitAddNewLocationsForYahooSERP();
  // }

  /**
   * Scheduled method to check and trigger the addition of new locations for Baidu SERP.
   * This method is executed once daily at 1:01 AM. It calls the `emitAddNewLocationsForBaiduSERP` method of `locationsJobEmitter`.
   *
   * @return {Promise<void>}
   */
  // @Cron('0 1 1 * *')
  // async checkForNewLocationsForBaiduSERP() {
  //   await this.locationsJobEmitter.emitAddNewLocationsForBaiduSERP();
  // }
  /**
   * Scheduled method to update SEO data for all keywords across Google and Bing.
   * This method runs daily at 21:01 and invokes the update methods for both Google and Bing.
   * It logs a debug message upon completion.
   *
   * @return {Promise<void>} A promise that resolves when the update operations are complete.
   */
  @Cron('0 1 21 * *')
  async updateDataFromDataForSEOForAllKeywords(): Promise<void> {
    await this.projectsService.updateDataFromDataForSEOForGoogleAllKeywords();
    await this.projectsService.updateDataFromDataForSEOForBingForAllKeywords();
    this.logger.debug('updateDataFromDataForSEOForAllKeywords');
  }

  /**
   * Executes a daily email report by invoking the emailReportsService to send
   * out an email report. This method is scheduled to run using a cron job.
   *
   * @return {Promise<void>} A promise that resolves when the email report has
   *         been successfully sent.
   */
  @Cron('*/15 * * * *')
  async dailyEmailReport(): Promise<void> {
    await this.emailReportsService.sendEmailReport();
  }

  /**
   * Cron job that runs every minute to check the status of trial subscriptions.
   * This method performs two checks:
   * 1. Identifies subscriptions whose trial periods are coming to an end.
   * 2. Identifies subscriptions whose trial periods have ended.
   *
   * @return A Promise that resolves when the checks are completed.
   */
  @Cron('* * * * *')
  async trialExpirationCheck(): Promise<void> {
    await this.subscriptionsService.checkThatTrialPeriodIsComingToAnEnd();
    await this.subscriptionsService.checkThatTrialPeriodIsOver();
  }

  /**
   * Allows manual updates for keywords by invoking the corresponding method
   * in the keywords service at scheduled intervals.
   *
   * @return {Promise<void>} A promise that resolves when the manual update is allowed.
   */
  @Cron('* * * * *')
  async allowManualUpdateForKeywords(): Promise<void> {
    await this.keywordsService.allowManualUpdateForKeywords();
  }

  /**
   * Cron job that schedules and updates keyword positions for various search engines at regular intervals.
   *
   * This method triggers updates for keyword positions across several platforms including:
   * - General periods
   * - Google Local
   * - Google Maps
   * - YouTube
   * - Bing
   * - Yahoo
   * - Baidu
   *
   * @return {Promise<void>} A promise that resolves when all keyword position updates are completed.
   */
  @Cron('* * * * *')
  async checkScheduledUpdatesOfKeywordPositions(): Promise<void> {
    await this.keywordsService.updateKeywordPositionsForPeriods();
    await this.keywordsService.updateKeywordPositionsForPeriodsForGoogleLocal();
    await this.keywordsService.updateKeywordPositionsForPeriodsForGoogleMaps();
    await this.keywordsService.updateKeywordPositionsForPeriodsForYoutube();
    await this.keywordsService.updateKeywordPositionsForPeriodsForBing();
    await this.keywordsService.updateKeywordPositionsForPeriodsForYahoo();
    await this.keywordsService.updateKeywordPositionsForPeriodsForBaidu();
  }

  /**
   * This method runs every two minutes and updates keywords that missed updates for various platforms.
   * It sequentially calls the service methods to update keywords for:
   * - General keywords
   * - Google Local
   * - Google Maps
   * - YouTube
   * - Bing
   * - Yahoo
   * - Baidu
   *
   * @return {Promise<void>} A promise that resolves when all update operations are complete.
   */
  @Cron('*/2 * * * *')
  async updateKeywordsThatMissedUpdates(): Promise<void> {
    await this.keywordsService.updateKeywordsThatMissedUpdates();
    await this.keywordsService.updatingKeywordsThatMissedUpdatesForGoogleLocal();
    await this.keywordsService.updatingKeywordsThatMissedUpdatesForGoogleMaps();
    await this.keywordsService.updatingKeywordsThatMissedUpdatesForYoutube();
    await this.keywordsService.updatingKeywordsThatMissedUpdatesForBing();
    await this.keywordsService.updatingKeywordsThatMissedUpdatesForYahoo();
    await this.keywordsService.updatingKeywordsThatMissedUpdatesForBaidu();
  }

  /**
   * Schedules the account deletion completion process to run daily at 00:10 a.m.
   *
   * @return {Promise<void>} A promise that resolves when the account deletion process is completed.
   */
  @Cron('0 10 0 * * *')
  async completeAccountDeletion(): Promise<void> {
    await this.accountsService.completeAccountDeletion();
    this.logger.debug('Called, every day at 00:10 a.m.');
  }

  /**
   * Scheduled cron job that runs daily at midnight to update the number of available daily updates.
   *
   * This method performs the following operations:
   * 1. Deactivates expired subscriptions.
   * 2. Resets limits for deactivated subscriptions.
   * 3. Updates the daily account limits.
   *
   * @return {Promise<void>} A promise that resolves when all update operations are complete.
   */
  @Cron('0 0 * * *')
  async updateNumberOfAvailableDailyUpdates(): Promise<void> {
    await this.subscriptionsService.deactivateExpiredSubscriptions();
    await this.accountLimitsService.resetDeactivatedSubscriptionLimits();
    await this.accountLimitsService.updateDailyAccountLimit();
    this.logger.debug('called, every 1 days at 00:00 am.');
  }

  /**
   * Scheduled cron job that runs every day at midnight (00:00 am) to update the number of daily email alerts sent.
   * Executes the updatingNumberOfDailyEmailAlertsSent method from the account limits service.
   * Logs a debug message indicating that the job was called.
   *
   * @return {Promise<void>} A promise that resolves when the update process completes.
   */
  @Cron('0 0 * * *')
  async updatingNumberOfDailyEmailAlertsSent(): Promise<void> {
    await this.accountLimitsService.updatingNumberOfDailyEmailAlertsSent();
    this.logger.debug('called, every 1 days at 00:00 am.');
  }
}
