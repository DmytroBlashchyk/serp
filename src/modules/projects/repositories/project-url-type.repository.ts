import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ProjectUrlTypeEntity } from 'modules/projects/entities/project-url-type.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(ProjectUrlTypeEntity)
export class ProjectUrlTypeRepository extends BaseRepository<ProjectUrlTypeEntity> {}
