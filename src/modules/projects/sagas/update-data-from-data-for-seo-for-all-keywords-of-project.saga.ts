import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent } from 'modules/projects/events/update-data-from-data-for-seo-for-all-keywords-of-project.event';
import { UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand } from 'modules/projects/commands/update-data-from-data-for-seo-for-all-keywords-of-project.command';

@Injectable()
export class UpdateDataFromDataForSeoForAllKeywordsOfProjectSaga {
  /**
   * Observes events of type `UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent`
   * and maps them to `UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand` commands.
   * The resulting commands are emitted as an Observable of `ICommand`.
   *
   * @param {Observable<UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent>} events - The source observable of events.
   * @returns {Observable<ICommand>} An observable that emits commands.
   */
  @Saga()
  updateDataFromDataForSeoForAllKeywordsOfProjectBySaga = (
    events: Observable<UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent),
        map(async (event) => {
          return new UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand(
            event.projectId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
