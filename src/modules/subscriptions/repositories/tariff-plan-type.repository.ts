import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TariffPlanTypeEntity } from 'modules/subscriptions/entities/tariff-plan-type.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';

@Injectable()
@EntityRepository(TariffPlanTypeEntity)
export class TariffPlanTypeRepository extends BaseRepository<TariffPlanTypeEntity> {}
