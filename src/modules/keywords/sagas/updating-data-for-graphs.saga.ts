import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { UpdateDataForKeywordRankingsEvent } from 'modules/keywords/events/update-data-for-keyword-rankings.event';
import { UpdateDataForKeywordRankingsCommand } from 'modules/keywords/commands/update-data-for-keyword-rankings.command';

@Injectable()
export class UpdatingDataForGraphsSaga {
  @Saga()
  updateDataForKeywordRankingsBySaga = (
    events: Observable<UpdateDataForKeywordRankingsEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(UpdateDataForKeywordRankingsEvent),
        map(async (event) => {
          return new UpdateDataForKeywordRankingsCommand(event.keywordIds);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
