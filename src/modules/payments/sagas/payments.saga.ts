import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { SubscriptionActivationEvent } from 'modules/payments/events/subscription-activation.event';
import { SubscriptionActivationCommand } from 'modules/payments/commands/subscription-activation.command';
import { TransactionUpdatedEvent } from 'modules/payments/events/transaction-updated.event';
import { TransactionUpdatedCommand } from 'modules/payments/commands/transaction-updated.command';
import { TransactionCreatedEvent } from 'modules/payments/events/transaction-created.event';
import { TransactionCreatedCommand } from 'modules/payments/commands/transaction-created.command';
import { TransactionReadyEvent } from 'modules/payments/events/transaction-ready.event';
import { TransactionReadyCommand } from 'modules/payments/commands/transaction-ready.command';
import { TransactionCompletedEvent } from 'modules/payments/events/transaction-completed.event';
import { TransactionCompletedCommand } from 'modules/payments/commands/transaction-completed.command';
import { TransactionPaymentFailedEvent } from 'modules/payments/events/transaction-payment-failed.event';
import { TransactionPaymentFailedCommand } from 'modules/payments/commands/transaction-payment.failed.command';
import { SubscriptionUpdatedEvent } from 'modules/payments/events/subscription-updated.event';
import { SubscriptionUpdatedCommand } from 'modules/payments/commands/subscription-updated.command';
import { SubscriptionCanceledEvent } from 'modules/payments/events/subscription-canceled.event';
import { SubscriptionCanceledCommand } from 'modules/payments/commands/subscription-canceled.command';

@Injectable()
export class PaymentsSaga {
  /**
   * Processes subscription activation events and converts them into commands.
   *
   * @param {Observable<SubscriptionActivationEvent>} events - An observable stream of subscription activation events.
   * @returns {Observable<ICommand>} - An observable stream of commands generated from the processed events.
   */
  @Saga()
  subscriptionActivationBySaga = (
    events: Observable<SubscriptionActivationEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(SubscriptionActivationEvent),
        map(async (event) => {
          return new SubscriptionActivationCommand(
            event.accountId,
            event.subscriptionId,
            event.customerId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Saga handler for processing transaction update events.
   *
   * This variable listens to an observable stream of `TransactionUpdatedEvent` events and converts each event into a `TransactionUpdatedCommand`  ICommand wrapped in an observable.
   *
   * @param {Observable<TransactionUpdatedEvent>} events - The stream of `TransactionUpdatedEvent` events.
   * @returns {Observable<ICommand>} An observable stream of `TransactionUpdatedCommand` commands.
   */
  @Saga()
  transactionUpdatedBySaga = (
    events: Observable<TransactionUpdatedEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(TransactionUpdatedEvent),
        map(async (event) => {
          return new TransactionUpdatedCommand(event.transactionId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Handles the creation of a transaction by reacting to TransactionCreatedEvent events.
   *
   * This function is a saga that listens for TransactionCreatedEvent events and, upon receiving such an event,
   * maps it to a TransactionCreatedCommand which is then emitted as an Observable stream of ICommand.
   *
   * @param {Observable<TransactionCreatedEvent>} events - The stream of TransactionCreatedEvent instances to be handled.
   * @returns {Observable<ICommand>} An Observable stream of ICommand derived from the TransactionCreatedEvent.
   */
  @Saga()
  transactionCreatedBySaga = (
    events: Observable<TransactionCreatedEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(TransactionCreatedEvent),
        map(async (event) => {
          return new TransactionCreatedCommand(
            event.accountId,
            event.transactionId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * The `transactionReadyBySaga` function processes a stream of `TransactionReadyEvent` events and transforms them
   * into `TransactionReadyCommand` commands. It listens to the event stream, filters the events of type
   * `TransactionReadyEvent`, and maps each event to a promise that resolves with a `TransactionReadyCommand` containing
   * the necessary transaction information. The function then flattens the stream of promises into an observable
   * stream of commands.
   *
   * @param {Observable<TransactionReadyEvent>} events - An observable stream of transaction ready events.
   * @returns {Observable<ICommand>} An observable stream of transaction ready commands.
   */
  @Saga()
  transactionReadyBySaga = (
    events: Observable<TransactionReadyEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(TransactionReadyEvent),
        map(async (event) => {
          return new TransactionReadyCommand(event.transactionId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * This variable processes a sequence of transaction completion events and
   * transforms them into a sequence of transaction completion commands.
   *
   * @param {Observable<TransactionCompletedEvent>} events - The observable stream of transaction completion events.
   * @returns {Observable<ICommand>} - The observable stream of transaction completion commands.
   */
  @Saga()
  transactionCompletedBySaga = (
    events: Observable<TransactionCompletedEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(TransactionCompletedEvent),
        map(async (event) => {
          return new TransactionCompletedCommand(event.transactionId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Handles events of type TransactionPaymentFailedEvent and transforms them into ICommand instances.
   *
   * @param {Observable<TransactionPaymentFailedEvent>} events - An observable stream of TransactionPaymentFailedEvent events.
   * @returns {Observable<ICommand>} An observable stream of ICommand instances derived from the events.
   */
  @Saga()
  transactionPaymentFailedBySaga = (
    events: Observable<TransactionPaymentFailedEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(TransactionPaymentFailedEvent),
        map(async (event) => {
          return new TransactionPaymentFailedCommand(event.transactionId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * The `subscriptionUpdatedBySaga` function is an observable stream that listens for `SubscriptionUpdatedEvent` events
   * and transforms these events into `SubscriptionUpdatedCommand` commands.
   *
   * @param {Observable<SubscriptionUpdatedEvent>} events - An observable stream of `SubscriptionUpdatedEvent` events.
   * @returns {Observable<ICommand>} - An observable stream of `ICommand` commands resulting from the transformation of the events.
   */
  @Saga()
  subscriptionUpdatedBySaga = (
    events: Observable<SubscriptionUpdatedEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(SubscriptionUpdatedEvent),
        map(async (event) => {
          return new SubscriptionUpdatedCommand(event.subscriptionId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * Transforms a stream of SubscriptionCanceledEvent instances into a stream
   * of SubscriptionCanceledCommand instances. This function operates within
   * a reactive programming paradigm using Observables.
   *
   * @param {Observable<SubscriptionCanceledEvent>} events - An Observable stream of SubscriptionCanceledEvent objects.
   * @returns {Observable<ICommand>} An Observable stream of ICommand objects, specifically SubscriptionCanceledCommand instances.
   */
  @Saga()
  subscriptionCanceledBySaga = (
    events: Observable<SubscriptionCanceledEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(SubscriptionCanceledEvent),
        map(async (event) => {
          return new SubscriptionCanceledCommand(event.subscriptionId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
