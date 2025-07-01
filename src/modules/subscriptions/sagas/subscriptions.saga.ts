import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { UnsubscriptionEvent } from 'modules/subscriptions/events/unsubscription.event';
import { UnsubscriptionCommand } from 'modules/subscriptions/commands/unsubscription.command';
import { SubscriptionDeactivationEvent } from 'modules/subscriptions/events/subscription-deactivation.event';
import { SubscriptionDeactivationCommand } from 'modules/subscriptions/commands/subscription-deactivation.command';
import { CustomerUpgradeEvent } from 'modules/subscriptions/events/customer-upgrade.event';
import { CustomerUpgradeCommand } from 'modules/subscriptions/commands/customer-upgrade.command';

@Injectable()
export class SubscriptionsSaga {
  /**
   * Handles the customer upgrade process by listening to events and generating corresponding commands.
   *
   * @param {Observable<CustomerUpgradeEvent>} events - An observable stream of customer upgrade events.
   * @returns {Observable<ICommand>} - An observable stream of commands generated from the events.
   */
  @Saga()
  customerUpgradeBySaga = (
    events: Observable<CustomerUpgradeEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CustomerUpgradeEvent),
        map(async (event) => {
          return new CustomerUpgradeCommand(event.userId, event.newEmail);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Transforms a stream of UnsubscriptionEvent events into a stream of ICommand commands.
   *
   * @param {Observable<UnsubscriptionEvent>} events - An observable stream of unsubscription events.
   * @return {Observable<ICommand>} An observable stream of ICommand commands generated from the unsubscription events.
   */
  @Saga()
  unsubscriptionBySaga = (
    events: Observable<UnsubscriptionEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UnsubscriptionEvent),
        map(async (event) => {
          return new UnsubscriptionCommand(
            event.accountId,
            event.typeOfReason,
            event.reason,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
  /**
   * Processes a stream of SubscriptionDeactivationEvents and maps them to a stream of SubscriptionDeactivationCommands.
   *
   * @param {Observable<SubscriptionDeactivationEvent>} events - An observable stream of SubscriptionDeactivationEvents.
   * @returns {Observable<ICommand>} - An observable stream of ICommand instances, specifically SubscriptionDeactivationCommands.
   */
  @Saga()
  subscriptionDeactivationBySaga = (
    events: Observable<SubscriptionDeactivationEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(SubscriptionDeactivationEvent),
        map(async (event) => {
          return new SubscriptionDeactivationCommand(event.subscriptionIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
