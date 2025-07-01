import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { CreateTriggerWithKeywordsEvent } from 'modules/triggers/events/create-trigger-with-keywords.event';
import { CreateTriggerWithKeywordsCommand } from 'modules/triggers/commands/create-trigger-with-keywords.command';
import { CreateTriggerInitializationEvent } from 'modules/triggers/events/create-trigger-initialization.event';
import { CreateTriggerInitializationCommand } from 'modules/triggers/commands/create-trigger-initialization.command';

@Injectable()
export class TriggersSaga {
  /**
   * Function to create triggers with keywords by handling saga events.
   *
   * @param {Observable<CreateTriggerWithKeywordsEvent>} events - Observable stream of CreateTriggerWithKeywordsEvent events.
   * @returns {Observable<ICommand>} - Observable stream of ICommand.
   */
  @Saga()
  createTriggerWithKeywordsBySaga = (
    events: Observable<CreateTriggerWithKeywordsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateTriggerWithKeywordsEvent),
        map(async (event) => {
          return new CreateTriggerWithKeywordsCommand(
            event.keywordIds,
            event.triggerId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Initializes trigger creation by processing a stream of CreateTriggerInitializationEvent events.
   *
   * @param {Observable<CreateTriggerInitializationEvent>} events - A stream of events to initialize triggers from.
   * @returns {Observable<ICommand>} - An observable stream of ICommand instances created from the events.
   */
  @Saga()
  createTriggerInitializationBySaga = (
    events: Observable<CreateTriggerInitializationEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateTriggerInitializationEvent),
        map(async (event) => {
          if (event.keywordIds.length > 0) {
            return new CreateTriggerInitializationCommand(event.keywordIds);
          }
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
