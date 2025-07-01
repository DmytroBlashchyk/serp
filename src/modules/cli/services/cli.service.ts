import { Injectable } from '@nestjs/common';
import { LoggingService } from 'modules/logging/services/logging.service';
import { Command, Positional } from 'nestjs-command';
import { LocationsJobEmitter } from 'modules/countries/job-emmiters/locations.job-emitter';
import { AccountsJobEmitter } from 'modules/accounts/job-emitters/accounts.job-emitter';

@Injectable()
export class CliService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly locationsJobEmitter: LocationsJobEmitter,
    private readonly accountsJobEmitter: AccountsJobEmitter,
  ) {}

  @Command({
    command: 'emit:update-locations-for-bing-keyword-data',
    describe:
      'Emits "UpdateLocationsForGoogleKeywordData" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForBingKeywordData(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForBingKeywordData...');
    await this.locationsJobEmitter.emitUpdateLocationsForBingKeywordData();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:update-locations-for-google-keyword-data',
    describe:
      'Emits "UpdateLocationsForGoogleKeywordData" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForGoogleKeywordData(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForGoogleKeywordData...');
    await this.locationsJobEmitter.emitUpdateLocationsForGoogleKeywordData();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:update-locations-for-yahoo-serp',
    describe:
      'Emits "UpdateLocationsForYahooSERP" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForYahooSERP(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForYahooSERP...');
    await this.locationsJobEmitter.emitUpdateLocationsForYahooSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:update-locations-for-youtube-serp',
    describe:
      'Emits "UpdateLocationsForYoutubeSERP" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForYoutubeSERP(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForYoutubeSERP...');
    await this.locationsJobEmitter.emitUpdateLocationsForYoutubeSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:update-locations-for-bing-serp',
    describe:
      'Emits "UpdateLocationsForBingSERP" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForBingSERP(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForBingSERP...');
    await this.locationsJobEmitter.emitUpdateLocationsForBingSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:update-locations-for-google-serp',
    describe:
      'Emits "UpdateLocationsForGoogleSERP" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForGoogleSERP(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForGoogleSERP...');
    await this.locationsJobEmitter.emitUpdateLocationsForGoogleSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:update-locations-for-baidu-serp',
    describe:
      'Emits "UpdateLocationsForBaiduSERP" job, which then is handled by queue process.',
  })
  async emitUpdateLocationsForBaiduSERP(): Promise<void> {
    this.loggingService.log('Emitting UpdateLocationsForBaiduSERP...');
    await this.locationsJobEmitter.emitUpdateLocationsForBaiduSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-keyword-data-locations-for-bing',
    describe:
      'Emits "AddNewKeywordDataLocationsForBing" job, which then is handled by queue process.',
  })
  async emitAddNewKeywordDataLocationsForBing(): Promise<void> {
    this.loggingService.log('Emitting AddNewKeywordDataLocationsForBing...');
    await this.locationsJobEmitter.emitAddNewKeywordDataLocationsForBing();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-keyword-data-locations-for-google',
    describe:
      'Emits "AddNewKeywordDataLocationsForGoogle" job, which then is handled by queue process.',
  })
  async emitAddNewKeywordDataLocationsForGoogle(): Promise<void> {
    this.loggingService.log('Emitting AddNewKeywordDataLocationsForGoogle...');
    await this.locationsJobEmitter.emitAddNewKeywordDataLocationsForGoogle();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-locations-for-youtube-serp',
    describe:
      'Emits "AddNewLocationsForYoutubeSERP" job, which then is handled by queue process.',
  })
  async emitAddNewLocationsForYoutubeSERP(): Promise<void> {
    this.loggingService.log('Emitting AddNewLocationsForYoutubeSERP...');
    await this.locationsJobEmitter.emitAddNewLocationsForYoutubeSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-locations-for-baidu-serp',
    describe:
      'Emits "AddNewLocationsForBaiduSERP" job, which then is handled by queue process.',
  })
  async emitAddNewLocationsForBaiduSERP(): Promise<void> {
    this.loggingService.log('Emitting AddNewLocationsForBaiduSERP...');
    await this.locationsJobEmitter.emitAddNewLocationsForBaiduSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-locations-for-yahoo-serp',
    describe:
      'Emits "AddNewLocationsForYahooSERP" job, which then is handled by queue process.',
  })
  async emitAddNewLocationsForYahooSERP(): Promise<void> {
    this.loggingService.log('Emitting AddNewLocationsForYahooSERP...');
    await this.locationsJobEmitter.emitAddNewLocationsForYahooSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-locations-for-google-serp',
    describe:
      'Emits "AddNewLocationsForGoogleSERP" job, which then is handled by queue process.',
  })
  async emitAddNewLocationsForGoogleSERP(): Promise<void> {
    this.loggingService.log('Emitting AddNewLocationsForGoogleSERP...');
    await this.locationsJobEmitter.emitAddNewLocationsForGoogleSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command: 'emit:add-new-locations-for-bing-serp',
    describe:
      'Emits "AddNewLocationsForBingSERP" job, which then is handled by queue process.',
  })
  async emitAddNewLocationsForBingSERP(): Promise<void> {
    this.loggingService.log('Emitting AddNewLocationsForBingSERP...');
    await this.locationsJobEmitter.emitAddNewLocationsForBingSERP();
    this.loggingService.log('Done.');

    process.exit();
  }

  @Command({
    command:
      'emit:assign-a-limit-of-number-of-live-mode-updates-for-keywords-per-day-to-existing-accounts',
    describe:
      'Emits "Assign a limit of Number Of Live Mode Updates For Keywords Per Day to existing accounts" lob, which then is handler by queue process.',
  })
  async assignALimitOfNumberOfLiveModeUpdatesForKeywordsPerDayToExistingAccounts() {
    this.loggingService.log(
      'Emitting Assign a limit of Number Of Live Mode Updates For Keywords Per Day to existing accounts...',
    );
    await this.accountsJobEmitter.assignALimitOfNumberOfLiveModeUpdatesForKeywordsPerDayToExistingAccounts();
    this.loggingService.log('Done.');

    process.exit();
  }
}
