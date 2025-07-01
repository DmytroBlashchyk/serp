import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { KeywordPositionsForDayEntity } from 'modules/keywords/entities/keyword-positions-for-day.entity';
import { Injectable } from '@nestjs/common';
import moment from 'moment/moment';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

@Injectable()
export class KeywordPositionInfoResponseFactory extends BaseResponseFactory<
  KeywordPositionsForDayEntity[],
  any[]
> {
  createResponse(
    entity: KeywordPositionsForDayEntity[],
  ): Promise<any[]> | any[] {
    const keywordFor = `Keyword Position History for ${
      entity[0]?.keyword?.name ?? ''
    }`;

    return entity.map((item) => {
      const url =
        item.keyword.project.searchEngine.name ===
          SearchEnginesEnum.GoogleMaps ||
        item.keyword.project.searchEngine.name ===
          SearchEnginesEnum.GoogleMyBusiness ||
        item.keyword.project.searchEngine.name === SearchEnginesEnum.YouTube
          ? {}
          : { 'Found URL': item.url };
      return {
        [keywordFor]: '',
        Date: moment(item.updateDate).format('YYYY-MM-DD'),
        Position: item.position > 100 ? '>100' : item.position.toString(),
        ...url,
      };
    });
  }
}
