import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { concatAll, map } from 'rxjs/operators';
import { GetDataFromDataForSeoForGoogleAdsEvent } from 'modules/keywords/events/get-data-from-data-for-seo-for-google-ads.event';
import { UpdateKeywordDataWithDataForSeoCommand } from 'modules/keywords/commands/update-keyword-data-with-data-for-seo.command';
import { UpdateKeywordPositionsUsingStandardQueueEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue.event';
import { UpdateKeywordPositionsUsingStandardQueueCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue.command';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { StartOfKeywordUpdateCommand } from 'modules/keywords/commands/start-of-keyword-update.command';
import { AdditionOfKeywordsEvent } from 'modules/keywords/events/addition-of-keywords.event';
import { AdditionOfKeywordsCommand } from 'modules/keywords/commands/addition-of-keywords.command';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-google-local.event';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-google-local.command';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-google-maps.event';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleMapsCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-google-maps.command';
import { UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-youtube.event';
import { UpdateKeywordPositionsUsingStandardQueueForYoutubeCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-youtube.command';
import { UpdateKeywordPositionsUsingStandardQueueForBingEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-bing.event';
import { UpdateKeywordPositionsUsingStandardQueueForBingCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-bing.command';
import { UpdateKeywordPositionsUsingStandardQueueForYahooEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-yahoo.event';
import { UpdateKeywordPositionsUsingStandardQueueForYahooCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-yahoo.command';
import { UpdateKeywordPositionsUsingStandardQueueForBaiduEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-baidu.event';
import { UpdateKeywordPositionsUsingStandardQueueForBaiduCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-baidu.command';
import { GetCPCAndSearchVolumeEvent } from 'modules/keywords/events/get-cPC-and-search-volume.event';
import { GetCPCAndSearchVolumeCommand } from 'modules/keywords/commands/get-cPC-and-search-volume.command';

@Injectable()
export class UpdateKeywordsPositionsSaga {
  /**
   * Handles the Start of Keyword Update process by processing events and
   * emitting corresponding commands.
   *
   * @param {Observable<StartOfKeywordUpdateEvent>} events - An observable stream of StartOfKeywordUpdateEvent.
   * @return {Observable<ICommand>} An observable stream of ICommand resulting from the handling of events.
   */
  @Saga()
  startOfKeywordUpdateBySaga = (
    events: Observable<StartOfKeywordUpdateEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(StartOfKeywordUpdateEvent),
        map(async (event) => {
          return new StartOfKeywordUpdateCommand(event.keywordIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Transforms an observable stream of GetCPCAndSearchVolumeEvent into an observable stream of ICommand.
   *
   * @param {Observable<GetCPCAndSearchVolumeEvent>} events - An observable stream of GetCPCAndSearchVolumeEvent.
   * @returns {Observable<ICommand>} An observable stream of ICommand.
   */
  @Saga()
  getCPCAndSearchVolumeEvent = (
    events: Observable<GetCPCAndSearchVolumeEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(GetCPCAndSearchVolumeEvent),
        map(async (event) => {
          return new GetCPCAndSearchVolumeCommand(
            event.keywordIds,
            event.projectId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Processes a stream of `GetDataFromDataForSeoForGoogleAdsEvent` and maps them to `UpdateKeywordDataWithDataForSeoCommand` instances.
   *
   * @param {Observable<GetDataFromDataForSeoForGoogleAdsEvent>} events - An observable stream of `GetDataFromDataForSeoForGoogleAdsEvent`.
   * @returns {Observable<ICommand>} - An observable stream of `ICommand` instances, each representing an `UpdateKeywordDataWithDataForSeoCommand`.
   */
  @Saga()
  getDataFromDataForSEOBySaga = (
    events: Observable<GetDataFromDataForSeoForGoogleAdsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(GetDataFromDataForSeoForGoogleAdsEvent),
        map(async (event) => {
          return new UpdateKeywordDataWithDataForSeoCommand(event.projectId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Processes a stream of AdditionOfKeywordsEvent and transforms them into corresponding AdditionOfKeywordsCommand.
   *
   * @param {Observable<AdditionOfKeywordsEvent>} events - An observable stream of AdditionOfKeywordsEvent objects.
   * @returns {Observable<ICommand>} - An observable stream of ICommand objects resulting from the transformation of events.
   */
  @Saga()
  additionOfKeywordsEventBySaga = (
    events: Observable<AdditionOfKeywordsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(AdditionOfKeywordsEvent),
        map(async (event) => {
          return new AdditionOfKeywordsCommand(
            event.accountId,
            event.numberOfKeywordsToBeAdded,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Function to update keyword positions using a standard queue approach specifically for Yahoo search engine by utilizing Saga pattern.
   *
   * @param {Observable<UpdateKeywordPositionsUsingStandardQueueForYahooEvent>} events - An observable stream of `UpdateKeywordPositionsUsingStandardQueueForYahooEvent` events.
   * @returns {Observable<ICommand>} An observable stream emitting `ICommand` instances based on the processed events.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueForYahooBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueForYahooEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueForYahooEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueForYahooCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Updates the positions of keywords using a standard queue specifically for Baidu by leveraging Redux-Saga for handling side effects.
   *
   * @param {Observable<UpdateKeywordPositionsUsingStandardQueueForBaiduEvent>} events - An observable stream of events related to updating keyword positions.
   * @returns {Observable<ICommand>} An observable stream of ICommand instances that encapsulate the commands for updating keyword positions.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueForBaiduBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueForBaiduEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueForBaiduEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueForBaiduCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Processes a stream of `UpdateKeywordPositionsUsingStandardQueueForBingEvent` events
   * and maps them to a stream of `ICommand` commands wrapped in observables.
   *
   * @param events An observable stream of `UpdateKeywordPositionsUsingStandardQueueForBingEvent` events.
   * @returns An observable stream of `ICommand` commands.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueForBingBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueForBingEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueForBingEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueForBingCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Handles the updates of keyword positions by consuming events from a standard queue.
   *
   * @param {Observable<UpdateKeywordPositionsUsingStandardQueueEvent>} events - An observable stream of events that trigger keyword position updates.
   * @returns {Observable<ICommand>} - An observable stream of commands derived from the events.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Handles the updating of keyword positions using a standard queue for Google Local.
   * This function accepts an `Observable` of `UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent`
   * and returns an `Observable` of `ICommand`.
   *
   * @param {Observable<UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent>} events - An observable stream of keyword update events.
   * @returns {Observable<ICommand>} An observable stream of commands to update keyword positions.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueForGoogleLocalBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Updates keyword positions using a standard queue specifically for Google Maps by handling a series of events.
   *
   * @param {Observable<UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent>} events - An observable stream of events related to updating keyword positions.
   * @returns {Observable<ICommand>} - An observable stream of commands to update keyword positions.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueForGoogleMapsBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Updates keyword positions using the standard queue for YouTube by saga.
   *
   * This function listens to a stream of `UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent`
   * events and maps each event to an asynchronous command that updates the keyword positions.
   * The resulting command is then transformed into an observable sequence using `from()`,
   * and all sequences are concatenated into a single observable.
   *
   * @param {Observable<UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent>} events - An observable stream of events for updating keyword positions.
   * @returns {Observable<ICommand>} An observable stream of commands to update the keyword positions.
   */
  @Saga()
  updateKeywordPositionsUsingStandardQueueForYoutubeBySaga = (
    events: Observable<UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent),
        map(async (event) => {
          return new UpdateKeywordPositionsUsingStandardQueueForYoutubeCommand(
            event.keywordIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
