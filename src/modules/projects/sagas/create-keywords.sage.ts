import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { CreateKeywordsEvent } from 'modules/projects/events/create-keywords.event';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { concatAll, map } from 'rxjs/operators';
import { CreateKeywordsCommand } from 'modules/projects/commands/create-keywords.command';
import { CreateKeywordsForGoogleLocalEvent } from 'modules/projects/events/create-keywords-for-google-local.event';
import { CreateKeywordsForGoogleLocalCommand } from 'modules/projects/commands/create-keywords-for-google-local.command';
import { CreateKeywordsForBaiduEvent } from 'modules/projects/events/create-keywords-for-baidu.event';
import { CreateKeywordsForBingEvent } from 'modules/projects/events/create-keywords-for-bing.event';
import { CreateKeywordsForGoogleMapsEvent } from 'modules/projects/events/create-keywords-for-google-maps.event';
import { CreateKeywordsForYahooEvent } from 'modules/projects/events/create-keywords-for-yahoo.event';
import { CreateKeywordsForYoutubeEvent } from 'modules/projects/events/create-keywords-for-youtube.event';
import { CreateKeywordsForBaiduCommand } from 'modules/projects/commands/create-keywords-for-baidu.command';
import { CreateKeywordsForBingCommand } from 'modules/projects/commands/create-keywords-for-bing.command';
import { CreateKeywordsForGoogleMapsCommand } from 'modules/projects/commands/create-keywords-for-google-maps.command';
import { CreateKeywordsForYahooCommand } from 'modules/projects/commands/create-keywords-for-yahoo.command';
import { CreateKeywordsForYoutubeCommand } from 'modules/projects/commands/create-keywords-for-youtube.command';

@Injectable()
export class CreateKeywordsSage {
  /**
   * `keywordsCreatedBySaga` is a function that processes a stream of `CreateKeywordsEvent`
   * and transforms them into a stream of `ICommand` objects. This is achieved using
   * various RxJS operators.
   *
   * @param {Observable<CreateKeywordsEvent>} events - An observable stream of `CreateKeywordsEvent`.
   * @returns {Observable<ICommand>} - An observable stream of `ICommand` objects.
   */
  @Saga()
  keywordsCreatedBySaga = (
    events: Observable<CreateKeywordsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsEvent),
        map(async (event) => {
          return new CreateKeywordsCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Function that processes keyword creation events for Google Local using RxJS observables.
   *
   * This function listens for `CreateKeywordsForGoogleLocalEvent` and transforms each event
   * into a `CreateKeywordsForGoogleLocalCommand` instance. The command is then output as an observable.
   *
   * @param events - An observable stream of `CreateKeywordsForGoogleLocalEvent`.
   * @returns An observable stream of `ICommand` generated from the event data.
   */
  @Saga()
  keywordsCreatedForGoogleLocalBySaga = (
    events: Observable<CreateKeywordsForGoogleLocalEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsForGoogleLocalEvent),
        map(async (event) => {
          return new CreateKeywordsForGoogleLocalCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * `keywordsCreatedForBaiduBySaga` is a function that processes a stream of `CreateKeywordsForBaiduEvent`
   * and transforms each event into a `CreateKeywordsForBaiduCommand`.
   *
   * The function takes an observable `events` of type `CreateKeywordsForBaiduEvent` and returns an observable
   * sequence of `ICommand` that can be used to handle further command logic.
   *
   * @param {Observable<CreateKeywordsForBaiduEvent>} events - The observable stream of `CreateKeywordsForBaiduEvent`.
   * @return {Observable<ICommand>} An observable stream of `ICommand` derived from the input events.
   */
  @Saga()
  keywordsCreatedForBaiduBySaga = (
    events: Observable<CreateKeywordsForBaiduEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsForBaiduEvent),
        map(async (event) => {
          return new CreateKeywordsForBaiduCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Function to create keywords specifically for Bing through a saga observable mechanism.
   *
   * @param {Observable<CreateKeywordsForBingEvent>} events - An observable stream of CreateKeywordsForBingEvent instances, which contain information about the keywords to be created.
   * @returns {Observable<ICommand>} - An observable stream of ICommand instances, which represent the commands to create the requested Bing keywords.
   */
  @Saga()
  keywordsCreatedForBingBySaga = (
    events: Observable<CreateKeywordsForBingEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsForBingEvent),
        map(async (event) => {
          return new CreateKeywordsForBingCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Transforms a stream of CreateKeywordsForGoogleMapsEvent events into a stream of
   * CreateKeywordsForGoogleMapsCommand commands through a series of RxJS operators.
   *
   * @param {Observable<CreateKeywordsForGoogleMapsEvent>} events - An Observable stream of
   * CreateKeywordsForGoogleMapsEvent instances.
   * @returns {Observable<ICommand>} An Observable stream of ICommand instances, each representing
   * a CreateKeywordsForGoogleMapsCommand.
   */
  @Saga()
  keywordsCreatedForGoogleMapsBySaga = (
    events: Observable<CreateKeywordsForGoogleMapsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsForGoogleMapsEvent),
        map(async (event) => {
          return new CreateKeywordsForGoogleMapsCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Transforms a stream of `CreateKeywordsForYahooEvent` events into a stream of `CreateKeywordsForYahooCommand` commands.
   *
   * This function processes each incoming event of type `CreateKeywordsForYahooEvent` and maps it to a `CreateKeywordsForYahooCommand`.
   * The output is an observable sequence of `ICommand` objects.
   *
   * @param {Observable<CreateKeywordsForYahooEvent>} events - The stream of input events.
   * @returns {Observable<ICommand>} - The resulting stream of commands.
   */
  @Saga()
  keywordsCreatedForYahooBySaga = (
    events: Observable<CreateKeywordsForYahooEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsForYahooEvent),
        map(async (event) => {
          return new CreateKeywordsForYahooCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Function to create commands for YouTube keywords based on incoming events.
   *
   * This function processes a stream of `CreateKeywordsForYoutubeEvent` events and generates
   * corresponding `CreateKeywordsForYoutubeCommand` commands. The transformation from event
   * to command is done asynchronously.
   *
   * @param {Observable<CreateKeywordsForYoutubeEvent>} events - A stream of events indicating requests to create YouTube keywords.
   * @returns {Observable<ICommand>} An observable stream of commands generated based on incoming events.
   */
  @Saga()
  keywordsCreatedForYoutubeBySaga = (
    events: Observable<CreateKeywordsForYoutubeEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateKeywordsForYoutubeEvent),
        map(async (event) => {
          return new CreateKeywordsForYoutubeCommand(
            event.projectId,
            event.accountId,
            event.keywords,
            event.deviceTypeName,
            event.tagIds,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
