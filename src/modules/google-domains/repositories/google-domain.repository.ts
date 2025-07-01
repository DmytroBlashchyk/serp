import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { GoogleDomainEntity } from 'modules/google-domains/entities/google-domain.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(GoogleDomainEntity)
export class GoogleDomainRepository extends BaseRepository<GoogleDomainEntity> {
  /**
   * Retrieves a GoogleDomainEntity by its unique identifier.
   *
   * @param {IdType} googleDomainId - The unique identifier of the Google domain.
   * @return {Promise<GoogleDomainEntity>} A promise that resolves to the GoogleDomainEntity object.
   */
  async getGoogleDomainById(
    googleDomainId: IdType,
  ): Promise<GoogleDomainEntity> {
    return this.findOne(googleDomainId);
  }
}
