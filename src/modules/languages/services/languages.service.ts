import { Injectable, NotFoundException } from '@nestjs/common';
import { LanguageRepository } from 'modules/languages/repositories/language.repository';
import { LanguagesResponse } from 'modules/languages/responses/languages.response';
import { IdType } from 'modules/common/types/id-type.type';
import { LanguageEntity } from 'modules/languages/entities/language.entity';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';

@Injectable()
export class LanguagesService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async getLanguageForYoutube(id: IdType): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageByIdForYoutube(
      id,
    );
    if (!language) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }

  async getLanguageFotYahoo(id: IdType): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageByIdForYahoo(id);
    if (!language) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }

  async getLanguageForBaidu(id: IdType): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageByIdForBaidu(id);
    if (!language) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }

  async getLanguageForGoogle(id: IdType): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageByIdForGoogle(id);
    if (!language) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }

  /**
   * Retrieves all available languages from the repository.
   *
   * @return {Promise<LanguagesResponse>} A promise that resolves to a LanguagesResponse object containing the list of languages.
   */
  async getAll(): Promise<LanguagesResponse> {
    const languages = await this.languageRepository.getSupportedLanguages();
    return new LanguagesResponse({ items: languages });
  }

  async getAllForBing(): Promise<LanguagesResponse> {
    const languages =
      await this.languageRepository.getSupportedLanguagesForBing();
    return new LanguagesResponse({ items: languages });
  }

  async getAllForBaidu(): Promise<LanguagesResponse> {
    const languages =
      await this.languageRepository.getSupportedLanguagesForBaidu();
    return new LanguagesResponse({ items: languages });
  }

  async getAllForYahoo(): Promise<LanguagesResponse> {
    const languages =
      await this.languageRepository.getSupportedLanguagesForYahoo();
    return new LanguagesResponse({ items: languages });
  }

  async getAllForYoutube(): Promise<LanguagesResponse> {
    const languages =
      await this.languageRepository.getSupportedLanguagesForYoutube();
    return new LanguagesResponse({ items: languages });
  }

  /**
   * Retrieves a language entity by its identifier.
   *
   * @param {IdType} id - The identifier of the language to retrieve.
   * @return {Promise<LanguageEntity>} A promise that resolves to the language entity.
   * @throws {NotFoundException} Throws if a language with the specified ID is not found.
   */
  async getLanguage(id: IdType): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageById(id);
    if (!language && !language.serp) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }

  async getLanguageForBing(id: IdType): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageById(id);
    if (!language && !language.serpBing) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }

  /**
   * Retrieves a language entity by its name.
   *
   * @param {string} name - The name of the language to retrieve.
   * @return {Promise<LanguageEntity>} A promise that resolves to the language entity.
   * @throws {NotFoundException} If the language is not found.
   */
  async getLanguageByName(name: string): Promise<LanguageEntity> {
    const language = await this.languageRepository.getLanguageByName(name);
    if (!language) {
      throw new NotFoundException('Language not found.');
    }
    return language;
  }
}
