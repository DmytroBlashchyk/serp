import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { BatchesService } from 'modules/batches/services/batches.service';

@ApiTags('Batches')
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  /**
   * Saves the search result provided in the request body.
   *
   * @param {any} body - The search result data to be saved.
   * @return {Promise<void>} A promise that resolves when the search result is saved.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post('search-result')
  async saveSearchResult(@Body() body: any): Promise<void> {
    return this.batchesService.saveSearchResult(body);
  }

  /**
   * Processes a batch search request using the provided result set and batch data.
   *
   * @param {object} payload - The payload containing result set and batch information.
   * @param {Array} payload.result_set - The set of results to be processed.
   * @param {object} payload.batch - The batch information for processing.
   * @return {Promise<any>} The result of batch search processing.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post()
  async valueSerp(@Body() payload: any) {
    return this.batchesService.batchSearchProcessing(
      payload.result_set,
      payload.batch,
    );
  }

  /**
   * Saves the keyword positions based on the provided body.
   *
   * @param {any} body - The request payload containing keyword positions.
   * @return {Promise<void>} A promise that resolves when the keyword positions have been saved.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post('keyword-positions')
  keywordPositions(@Body() body: any): Promise<void> {
    return this.batchesService.saveKeywordPositions(body);
  }
}
