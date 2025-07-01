import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { LanguageEntity } from 'modules/languages/entities/language.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(LanguageEntity)
export class LanguageRepository extends BaseRepository<LanguageEntity> {
  async getLanguageByIdForYoutube(id: IdType): Promise<LanguageEntity> {
    return this.findOne({ where: { id, serpYouTube: true } });
  }

  async getLanguageByIdForYahoo(id: IdType): Promise<LanguageEntity> {
    return this.findOne({ where: { id, serpYahoo: true } });
  }
  async getLanguageByIdForBaidu(id: IdType): Promise<LanguageEntity> {
    return this.findOne({ where: { id, serpBaidu: true } });
  }

  async getLanguageByIdForGoogle(id: IdType): Promise<LanguageEntity> {
    return this.findOne({ where: { id, serp: true } });
  }

  async getSupportedLanguagesForBaidu(): Promise<LanguageEntity[]> {
    return this.find({ where: { serpBaidu: true } });
  }

  async getSupportedLanguagesForYahoo(): Promise<LanguageEntity[]> {
    return this.find({ where: { serpYahoo: true } });
  }

  async getSupportedLanguagesForYoutube(): Promise<LanguageEntity[]> {
    return this.find({ where: { serpYouTube: true } });
  }

  async getSupportedLanguagesForBing(): Promise<LanguageEntity[]> {
    return this.find({ where: { serpBing: true } });
  }

  async getSupportedLanguages(): Promise<LanguageEntity[]> {
    return this.find({ where: { serp: true } });
  }

  /**
   * Retrieves a language entity by its name.
   *
   * @param {string} name - The name of the language to retrieve.
   * @return {Promise<LanguageEntity>} A promise that resolves to the language entity.
   */
  async getLanguageByName(name: string): Promise<LanguageEntity> {
    return this.findOne({ where: { name } });
  }

  /**
   * Retrieves a language entity by its unique identifier.
   *
   * @param {IdType} id - The unique identifier of the language entity.
   * @return {Promise<LanguageEntity>} A promise that resolves to the language entity corresponding to the given identifier.
   */
  async getLanguageById(id: IdType): Promise<LanguageEntity> {
    return this.findOne(id);
  }
}
