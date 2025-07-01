import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { AlertKeywordViewEntity } from 'modules/alerts/entities/alert-keyword-view.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(AlertKeywordViewEntity)
export class AlertKeywordViewRepository extends BaseRepository<AlertKeywordViewEntity> {}
