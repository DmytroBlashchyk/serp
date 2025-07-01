import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { AssignProjectToAFolderManagerEvent } from 'modules/invitations/events/assign-project-to-a-folder-manager.event';
import { concatAll, map } from 'rxjs/operators';
import { AssignProjectToAFolderManagerCommand } from 'modules/invitations/commands/assign-project-to-a-folder-manager.command';
import { AssigningAChildFolderToParentFolderManagerEvent } from 'modules/invitations/events/assigning-a-child-folder-to-parent-folder-manager.event';
import { AssigningAChildFolderToParentFolderManagerCommand } from 'modules/invitations/commands/assigning-a-child-folder-to-parent-folder-manager.command';

@Injectable()
export class InvitationsSaga {
  /**
   * Processes a stream of AssignProjectToAFolderManagerEvent events and maps them
   * to AssignProjectToAFolderManagerCommand commands.
   *
   * @param {Observable<AssignProjectToAFolderManagerEvent>} events - The stream of events to process.
   * @returns {Observable<ICommand>} A stream of commands resulting from the processed events.
   */
  @Saga()
  assignProjectToAFolderManagerBySaga = (
    events: Observable<AssignProjectToAFolderManagerEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(AssignProjectToAFolderManagerEvent),
        map(async (event) => {
          return new AssignProjectToAFolderManagerCommand(
            event.folderId,
            event.projectId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Observable saga to handle the assignment of a child folder to a parent folder manager.
   *
   * @param {Observable<AssigningAChildFolderToParentFolderManagerEvent>} events - The stream of events related to the assignment of a child folder to a parent folder manager.
   * @returns {Observable<ICommand>} The stream of commands generated from the given events.
   */
  @Saga()
  assigningAChildFolderToParentFolderManagerBySaga = (
    events: Observable<AssigningAChildFolderToParentFolderManagerEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(AssigningAChildFolderToParentFolderManagerEvent),
        map(async (event) => {
          return new AssigningAChildFolderToParentFolderManagerCommand(
            event.folderId,
            event.accountId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
