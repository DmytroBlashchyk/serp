import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ReasonsForUnsubscriptionEntity } from 'modules/subscriptions/entities/reasons-for-unsubscription.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(ReasonsForUnsubscriptionEntity)
export class ReasonsForUnsubscriptionRepository extends BaseRepository<ReasonsForUnsubscriptionEntity> {}
