import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { DeleteFoldersEvent } from 'modules/folders/events/delete-folders.event';
import { DeleteFoldersCommand } from 'modules/folders/commands/delete-folders.command';

@Injectable()
export class FoldersSaga {
  /**
   * Handles the saga for deleting folders based on a series of delete events.
   *
   * @param {Observable<DeleteFoldersEvent>} events - An observable stream of DeleteFoldersEvent.
   * @returns {Observable<ICommand>} - An observable stream of ICommand, which represents the delete folder commands.
   */
  @Saga()
  deleteFoldersBySaga = (
    events: Observable<DeleteFoldersEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(DeleteFoldersEvent),
        map(async (event) => {
          return new DeleteFoldersCommand(event.folderIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
