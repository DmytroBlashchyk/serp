import { Body, Controller, Get, Post } from '@nestjs/common';
import { TaskReadyRequest } from 'modules/fastify/requests/task-ready.request';
import { KeywordUpdatingService } from 'modules/fastify/services/keyword-updating.service';

@Controller('data')
export class KeywordUpdatingController {
  constructor(
    private readonly keywordUpdatingService: KeywordUpdatingService,
  ) {}
  /**
   * Endpoint that handles updating keywords.
   *
   * @param {TaskReadyRequest} body - The request body containing tasks with keywords to update.
   * @return {Promise<void>} - A promise that resolves when the keyword update results are saved.
   */
  @Post('keyword-updating')
  updating(@Body() body: TaskReadyRequest): Promise<void> {
    return this.keywordUpdatingService.savingResultsOfKeywordUpdate(
      body.tasks[0].data.tag,
      body.tasks[0].result[0].items?.length > 0
        ? body.tasks[0].result[0].items
        : [],
    );
  }

  /**
   * Handles the 'task-ready' POST request.
   *
   * @param {TaskReadyRequest} body - The request body containing task information.
   * @return {Promise<void>} A promise that resolves when the task has been processed.
   */
  @Post('task-ready')
  async taskReady(@Body() body: TaskReadyRequest): Promise<void> {
    if (body.tasks_count > 0) {
      return this.keywordUpdatingService.saveResultsOfReadyTask(body.tasks[0]);
    }
  }
}
