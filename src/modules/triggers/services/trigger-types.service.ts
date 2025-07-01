import { Injectable, NotFoundException } from '@nestjs/common';
import { TriggerTypeRepository } from 'modules/triggers/repositories/trigger-type.repository';
import { TriggerTypesResponse } from 'modules/triggers/responses/trigger-types.response';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { TriggerTypeEntity } from 'modules/triggers/entities/trigger-type.entity';

@Injectable()
export class TriggerTypesService {
  constructor(private readonly triggerTypeRepository: TriggerTypeRepository) {}

  /**
   * Retrieves the trigger type entity based on the provided name.
   *
   * @param {TriggerTypeEnum} name - The name of the trigger type to retrieve.
   * @return {Promise<TriggerTypeEntity>} A promise that resolves to the trigger type entity.
   * @throws {NotFoundException} If the trigger type is not found.
   */
  async getTriggerType(name: TriggerTypeEnum): Promise<TriggerTypeEntity> {
    const triggerType = await this.triggerTypeRepository.getTriggerTypeByName(
      name,
    );
    if (!triggerType) {
      throw new NotFoundException('Trigger type not found.');
    }
    return triggerType;
  }

  /**
   * Fetches all trigger types from the repository.
   *
   * @return {Promise<TriggerTypesResponse>} A promise that resolves to a TriggerTypesResponse object
   * containing all the trigger types.
   */
  async getAllTriggerTypes(): Promise<TriggerTypesResponse> {
    const triggerTypes = await this.triggerTypeRepository.find();
    return new TriggerTypesResponse({ items: triggerTypes });
  }
}
