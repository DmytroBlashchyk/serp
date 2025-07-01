import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { ReasonsForAccountDeletionEntity } from 'modules/accounts/entities/reasons-for-account-deletion.entity';

@Injectable()
@EntityRepository(ReasonsForAccountDeletionEntity)
export class ReasonsForAccountDeletionRepository extends BaseRepository<ReasonsForAccountDeletionEntity> {}
