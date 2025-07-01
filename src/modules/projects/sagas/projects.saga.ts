import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { RemoteProjectsEvent } from 'modules/projects/events/remote-projects.event';
import { RemoteProjectsCommand } from 'modules/projects/commands/remote-projects.command';
import { DeleteProjectsEvent } from 'modules/projects/events/delete-projects.event';
import { DeleteProjectsCommand } from 'modules/projects/commands/delete-projects.command';
import { DetermineNumberOfAccountProjectsEvent } from 'modules/projects/events/determine-number-of-account-projects.event';
import { DetermineNumberOfAccountProjectsCommand } from 'modules/projects/commands/determine-number-of-account-projects.command';
import { UpdateDataForProjectsEvent } from 'modules/projects/events/update-data-for-projects.event';
import { UpdateDataForProjectsCommand } from 'modules/projects/commands/update-data-for-projects.command';
import { DeleteAssignedProjectsEvent } from 'modules/projects/events/delete-assigned-projects.event';
import { DeleteAssignedProjectsCommand } from 'modules/projects/commands/delete-assigned-projects.command';

@Injectable()
export class ProjectsSaga {
  /**
   * deleteAssignedProjectsBySaga handles the deletion of assigned projects.
   *
   * @param {Observable<DeleteAssignedProjectsEvent>} events - Stream of events
   *        triggering the deletion of assigned projects.
   * @return {Observable<ICommand>} An observable stream emitting commands
   *        to delete the assigned projects.
   */
  @Saga()
  deleteAssignedProjectsBySaga = (
    events: Observable<DeleteAssignedProjectsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(DeleteAssignedProjectsEvent),
        map(async (event) => {
          return new DeleteAssignedProjectsCommand(event.projectIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Handles the updating of data for projects by observing a stream of events.
   *
   * @param {Observable<UpdateDataForProjectsEvent>} events - The stream of events to observe for updates.
   * @returns {Observable<ICommand>} - An observable stream of commands that are created from the events.
   */
  @Saga()
  updateDataForProjectsBySaga = (
    events: Observable<UpdateDataForProjectsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateDataForProjectsEvent),
        map(async (event) => {
          return new UpdateDataForProjectsCommand(event.projectId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Transforms a stream of RemoteProjectsEvent into a stream of ICommand.
   *
   * @param {Observable<RemoteProjectsEvent>} events - An observable stream of RemoteProjectsEvent instances.
   * @returns {Observable<ICommand>} An observable stream of ICommand instances generated from the RemoteProjectsEvent.
   */
  @Saga()
  remoteProjectsBySaga = (
    events: Observable<RemoteProjectsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(RemoteProjectsEvent),
        map(async (event) => {
          return new RemoteProjectsCommand(event.accountId, event.projectIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Handles the deletion of projects by reacting to the DeleteProjectsEvent.
   *
   * @param {Observable<DeleteProjectsEvent>} events - Observable stream of DeleteProjectsEvent instances.
   * @returns {Observable<ICommand>} Observable stream of DeleteProjectsCommand instances.
   */
  @Saga()
  deleteProjectsBySaga = (
    events: Observable<DeleteProjectsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(DeleteProjectsEvent),
        map(async (event) => {
          return new DeleteProjectsCommand(event.accountId, event.projectIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * A saga function that determines the number of projects associated with an account.
   * It listens for the `DetermineNumberOfAccountProjectsEvent` events, maps each event to a
   * `DetermineNumberOfAccountProjectsCommand` and returns an Observable of these commands.
   *
   * @param {Observable<DetermineNumberOfAccountProjectsEvent>} events - An observable stream of DetermineNumberOfAccountProjectsEvent.
   * @returns {Observable<ICommand>} An observable stream of DetermineNumberOfAccountProjectsCommand.
   */
  @Saga()
  determineNumberOfAccountProjectsBySaga = (
    events: Observable<DetermineNumberOfAccountProjectsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(DetermineNumberOfAccountProjectsEvent),
        map(async (event) => {
          return new DetermineNumberOfAccountProjectsCommand(event.accountId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
