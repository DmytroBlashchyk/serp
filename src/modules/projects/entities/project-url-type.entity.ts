import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { ProjectUrlTypesEnum } from 'modules/projects/enums/project-url-types.enum';
import { Entity } from 'typeorm';

@Entity('project_url_types')
export class ProjectUrlTypeEntity extends BaseEnumEntity<ProjectUrlTypesEnum> {}
