import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { CompetitorEntity } from 'modules/competitors/entities/competitor.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(CompetitorEntity)
export class CompetitorRepository extends BaseRepository<CompetitorEntity> {
  /**
   * Retrieves a list of competitors based on the provided competitor IDs.
   *
   * @param {IdType[]} competitorIds - An array of competitor IDs to look up.
   * @return {Promise<CompetitorEntity[]>} A promise that resolves to an array of CompetitorEntity objects.
   */
  async getCompetitors(competitorIds: IdType[]): Promise<CompetitorEntity[]> {
    return this.createQueryBuilder('competitors')
      .where('competitors.id in(:...competitorIds)', { competitorIds })
      .getMany();
  }
  /**
   * Fetches a list of competitors associated with a given keyword ID.
   *
   * @param {IdType} keywordId - The ID of the keyword to search for related competitors.
   * @return {Promise<CompetitorEntity[]>} A promise that resolves to an array of competitor entities.
   */
  async getCompetitorsByKeywordId(
    keywordId: IdType,
  ): Promise<CompetitorEntity[]> {
    return this.createQueryBuilder('competitors')
      .leftJoinAndSelect('competitors.project', 'project')
      .leftJoinAndSelect('project.keywords', 'keywords')
      .where('keywords.id =:keywordId', { keywordId })
      .getMany();
  }
  /**
   * Deletes competitors from the database based on provided IDs.
   *
   * @param {IdType[]} ids - An array of competitor IDs to be deleted.
   * @return {Promise<void>} - A promise that resolves once the deletion process is complete.
   */
  async deleteCompetitorsByIds(ids: IdType[]): Promise<void> {
    await this.createQueryBuilder('competitors')
      .where('competitors.id in(:...ids)', { ids })
      .delete()
      .execute();
  }
  /**
   * Retrieves a list of competitor entities associated with a given project ID.
   *
   * @param {IdType} projectId - The ID of the project.
   * @return {Promise<CompetitorEntity[]>} A promise that resolves to an array of competitor entities.
   */
  async getCompetitorsByProjectIdAndAccountId(
    projectId: IdType,
  ): Promise<CompetitorEntity[]> {
    return this.createQueryBuilder('competitors')
      .leftJoinAndSelect('competitors.project', 'project')
      .where('project.id =:projectId', {
        projectId,
      })
      .getMany();
  }
}
