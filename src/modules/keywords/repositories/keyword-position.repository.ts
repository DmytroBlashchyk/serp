import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { KeywordPositionEntity } from 'modules/keywords/entities/keyword-position.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(KeywordPositionEntity)
export class KeywordPositionRepository extends BaseRepository<KeywordPositionEntity> {
  /**
   * Deletes keyword positions based on the provided keyword IDs.
   *
   * @param {IdType[]} ids - An array of keyword IDs whose positions are to be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteKeywordPositionsByKeywordIds(ids: IdType[]): Promise<void> {
    await this.createQueryBuilder('keywords_positions')
      .where('keywords_positions.keyword_id In(:...ids)', { ids })
      .delete()
      .execute();
  }
}
