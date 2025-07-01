import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { DeletingEmptySharedLinksEvent } from 'modules/shared-links/events/deleting-empty-shared-links.event';
import { DeletingEmptySharedLinksCommand } from 'modules/shared-links/commands/deleting-empty-shared-links.command';

@Injectable()
export class SharedLinksSaga {
  /**
   * Function `deletingEmptySharedLinksEventBySaga` processes a stream of `DeletingEmptySharedLinksEvent`
   * events and returns a stream of corresponding `ICommand` commands.
   *
   * @param {Observable<DeletingEmptySharedLinksEvent>} events - An observable stream of `DeletingEmptySharedLinksEvent` events.
   * @returns {Observable<ICommand>} - An observable stream of `ICommand` commands.
   */
  @Saga()
  deletingEmptySharedLinksEventBySaga = (
    events: Observable<DeletingEmptySharedLinksEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(DeletingEmptySharedLinksEvent),
        map(async (event) => {
          return new DeletingEmptySharedLinksCommand(
            event.sharedLinkIds,
            event.accountId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
