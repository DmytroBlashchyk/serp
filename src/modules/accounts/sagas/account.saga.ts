import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { CreateTrialPlanCommand } from 'modules/subscriptions/commands/create-trial-plan.command';
import { CreateATrialPeriodEvent } from 'modules/accounts/events/create-a-trial-period.event';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { RefreshFolderTreeCommand } from 'modules/accounts/commands/refresh-folder-tree.command';
import { CompleteAccountDeletionEvent } from 'modules/accounts/events/complete-account-deletion.event';
import { CompleteAccountDeletionCommand } from 'modules/accounts/commands/complete-account-deletion.command';

@Injectable()
export class AccountSaga {
  /**
   * completeAccountDeletionSaga is a function that handles the completion of account deletion saga.
   *
   * @param {Observable<CompleteAccountDeletionEvent>} events - An observable stream of CompleteAccountDeletionEvent.
   * @returns {Observable<ICommand>} - An observable stream of ICommand resulting from processing the events.
   */
  @Saga()
  completeAccountDeletionSaga = (
    events: Observable<CompleteAccountDeletionEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CompleteAccountDeletionEvent),
        map(async (event) => {
          return new CompleteAccountDeletionCommand(event.remoteAccountUser);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * createTrialPeriodSaga listens for CreateATrialPeriodEvent events and transforms them
   * into a CreateTrialPlanCommand.
   *
   * @param {Observable<CreateATrialPeriodEvent>} events - An observable stream of CreateATrialPeriodEvent objects.
   * @returns {Observable<ICommand>} An observable stream of ICommand objects resulting from the transformation.
   */
  @Saga()
  createTrialPeriodSaga = (
    events: Observable<CreateATrialPeriodEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateATrialPeriodEvent),
        map(async (event) => {
          return new CreateTrialPlanCommand(event.accountId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Processes a stream of `RefreshFolderTreeEvent` events to produce
   * corresponding `RefreshFolderTreeCommand` commands.
   *
   * @param {Observable<RefreshFolderTreeEvent>} events - Observable stream of `RefreshFolderTreeEvent`.
   * @returns {Observable<ICommand>} Observable stream of `RefreshFolderTreeCommand`.
   */
  @Saga()
  refreshFolderTreeBySaga = (
    events: Observable<RefreshFolderTreeEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(RefreshFolderTreeEvent),
        map(async (event) => {
          return new RefreshFolderTreeCommand(event.accountId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
