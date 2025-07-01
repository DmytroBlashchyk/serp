import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { CardEntity } from 'modules/transactions/entities/card.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';

@Injectable()
@EntityRepository(CardEntity)
export class CardRepository extends BaseRepository<CardEntity> {}
