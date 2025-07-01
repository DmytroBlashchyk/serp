import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { Entity } from 'typeorm';

@Entity('search_engines')
export class SearchEngineEntity extends BaseEnumEntity<SearchEnginesEnum> {}
