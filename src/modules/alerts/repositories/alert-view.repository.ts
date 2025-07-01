import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AlertViewEntity } from 'modules/alerts/entities/alert-view.entity';

@Injectable()
@EntityRepository(AlertViewEntity)
export class AlertViewRepository extends BaseRepository<AlertViewEntity> {}
