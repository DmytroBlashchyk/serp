import { MigrationInterface, QueryRunner } from 'typeorm';
import { languages } from 'modules/db/seeds/data/1727500433433-AddPermissionsForLanguages/serpLanguages';
import { LanguageEntity } from 'modules/languages/entities/language.entity';
import { keywordDatLanguages } from 'modules/db/seeds/data/1727500433433-AddPermissionsForLanguages/keywordDataLanguages';
import { languagesForBing } from 'modules/db/seeds/data/1727500433433-AddPermissionsForLanguages/serpLanguagesForBing';
import { keywordDatLanguagesForBing } from 'modules/db/seeds/data/1727500433433-AddPermissionsForLanguages/keywordDataLanguagesForBing';
import { languagesForYoutube } from 'modules/db/seeds/data/1727937083011-AddPermissionForNewLanguages/serpLanguagesForYoutube';
import { languagesForYahoo } from 'modules/db/seeds/data/1727753354102-AddNewPermissionsForLanguages/serpLanguagesForYahoo';
import { languagesForBaidu } from 'modules/db/seeds/data/1727753354102-AddNewPermissionsForLanguages/serpLanguagesForBaidu';

export class AddPermissionsForLanguages1727500433433
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(LanguageEntity);
    let allLanguages = await repository.find();
    const serpData = [];
    for (const language of await languages) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        serpData.push(findLanguage);
      }
    }
    await repository.save(
      serpData.map((item) => {
        return {
          id: item.id,
          serp: true,
        };
      }),
    );

    const keywordDataLanguages = [];
    for (const language of await keywordDatLanguages) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        keywordDataLanguages.push(findLanguage);
      }
    }
    await repository.save(
      keywordDataLanguages.map((item) => {
        return { id: item.id, keywordData: true };
      }),
    );

    const serpDataForBing = [];
    for (const language of await languagesForBing) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        serpDataForBing.push(findLanguage);
      }
    }
    await repository.save(
      serpDataForBing.map((item) => {
        return {
          id: item.id,
          serpBing: true,
        };
      }),
    );

    const keywordDataLanguagesForBing = [];
    for (const language of await keywordDatLanguagesForBing) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        keywordDataLanguagesForBing.push(findLanguage);
      }
    }
    await repository.save(
      keywordDataLanguagesForBing.map((item) => {
        return { id: item.id, keywordDataBing: true };
      }),
    );

    allLanguages = await repository.find();
    const serpDataForYoutube = [];
    for (const language of await languagesForYoutube) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        serpDataForYoutube.push(findLanguage);
      }
    }
    await repository.save(
      serpDataForYoutube.map((item) => {
        return {
          id: item.id,
          serpYouTube: true,
        };
      }),
    );

    allLanguages = await repository.find();
    const serpDataForYahoo = [];
    for (const language of await languagesForYahoo) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        serpDataForYahoo.push(findLanguage);
      }
    }
    await repository.save(
      serpDataForYahoo.map((item) => {
        return {
          id: item.id,
          serpYahoo: true,
        };
      }),
    );

    allLanguages = await repository.find();
    const serpDataForBaidu = [];
    for (const language of await languagesForBaidu) {
      const findLanguage = allLanguages.find(
        (item) => item.code === language.language_code,
      );
      if (findLanguage) {
        serpDataForBaidu.push(findLanguage);
      }
    }
    await repository.save(
      serpDataForBaidu.map((item) => {
        return {
          id: item.id,
          serpBaidu: true,
        };
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
