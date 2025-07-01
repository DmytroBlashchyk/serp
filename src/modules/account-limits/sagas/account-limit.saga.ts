import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { CreateAccountLimitsEvent } from 'modules/account-limits/events/create-account-limits.event';
import { CreateAccountLimitsCommand } from 'modules/account-limits/commands/create-account-limits.command';

@Injectable()
export class AccountLimitSaga {
  /**
   * Handles events related to creating account limits by saga.
   *
   * @param {Observable<CreateAccountLimitsEvent>} events - Observable stream of CreateAccountLimitsEvent objects.
   * @returns {Observable<ICommand>} Observable stream of ICommand objects resulting from processing the events.
   */
  @Saga()
  createAccountLimitsBySaga = (
    events: Observable<CreateAccountLimitsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateAccountLimitsEvent),
        map(async (event) => {
          return new CreateAccountLimitsCommand(
            event.accountId,
            event.tariffPlanName,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
