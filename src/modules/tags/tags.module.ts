import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTagRepository } from 'modules/tags/repositories/project-tag.repository';
import { ProjectsTagsService } from 'modules/tags/services/projects-tags.service';
import { TagsController } from 'modules/tags/constrollers/tags.controller';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { KeywordsTagsService } from 'modules/tags/services/keywords-tags.service';

/**
 * The TagsModule class is a module that integrates with TypeORM for database
 * interaction. It imports repositories and service classes related to project
 * and keyword tags.
 *
 * It declares dependency imports which include TypeOrmModule with specific
 * repositories such as ProjectTagRepository and KeywordTagRepository.
 *
 * The module provides various services including ProjectsTagsService and
 * KeywordsTagsService, which handle the business logic related to tags.
 *
 * Additionally, it includes a controller called TagsController to handle incoming
 * requests and route them to the appropriate services.
 *
 * The module also exports the services and TypeOrmModule configuration for
 * reuse in other modules.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectTagRepository, KeywordTagRepository]),
  ],
  providers: [ProjectsTagsService, KeywordsTagsService],
  controllers: [TagsController],
  exports: [
    ProjectsTagsService,
    KeywordsTagsService,
    TypeOrmModule.forFeature([ProjectTagRepository, KeywordTagRepository]),
  ],
})
export class TagsModule {}
