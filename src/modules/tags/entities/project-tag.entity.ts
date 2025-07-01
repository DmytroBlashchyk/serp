import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { ProjectEntity } from 'modules/projects/entities/project.entity';

@Entity('projects_tags')
export class ProjectTagEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @ManyToMany(() => ProjectEntity, (project) => project.tags, { lazy: true })
  projects: ProjectEntity[];
}
