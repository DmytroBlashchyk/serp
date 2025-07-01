import { MigrationInterface, QueryRunner } from 'typeorm';
import { LanguageEntity } from 'modules/languages/entities/language.entity';
import { languages } from 'modules/db/seeds/data/1727500433433-AddPermissionsForLanguages/serpLanguages';
import { keywordDatLanguages } from 'modules/db/seeds/data/1727500433433-AddPermissionsForLanguages/keywordDataLanguages';
import { languagesForYoutube } from 'modules/db/seeds/data/1727937083011-AddPermissionForNewLanguages/serpLanguagesForYoutube';
import { languagesForYahoo } from 'modules/db/seeds/data/1727753354102-AddNewPermissionsForLanguages/serpLanguagesForYahoo';
import { languagesForBaidu } from 'modules/db/seeds/data/1727753354102-AddNewPermissionsForLanguages/serpLanguagesForBaidu';

export class AddPermissionForNewLanguages1727937083011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(LanguageEntity);
    let allLanguages = await repository.find();
    const serpData = await languages;
    const thirdArray = serpData.filter(
      (secondObj) =>
        !allLanguages.some(
          (firstObj) => firstObj.code === secondObj.language_code,
        ),
    );
    await repository.save(
      thirdArray.map((item) => {
        return {
          code: item.language_code,
          name: item.language_name,
          serp: true,
        };
      }),
    );
    allLanguages = await repository.find();
    const keywordDataLanguages = await keywordDatLanguages;
    const keywordDataLanguagesThirdArray = keywordDataLanguages.filter(
      (secondObj) =>
        !allLanguages.some(
          (firstObj) => firstObj.code === secondObj.language_code,
        ),
    );

    await repository.save(
      keywordDataLanguagesThirdArray.map((item) => {
        return {
          code: item.language_code,
          name: item.language_name,
          keywordData: true,
        };
      }),
    );

    allLanguages = await repository.find();
    const dataLanguagesForYoutube = await languagesForYoutube;
    const dataLanguagesForYoutubeThirdArray = dataLanguagesForYoutube.filter(
      (secondObj) =>
        !allLanguages.some(
          (firstObj) => firstObj.code === secondObj.language_code,
        ),
    );

    await repository.save(
      dataLanguagesForYoutubeThirdArray.map((item) => {
        return {
          code: item.language_code,
          name: item.language_name,
          serpYouTube: true,
        };
      }),
    );

    allLanguages = await repository.find();
    const dataLanguagesForYahoo = await languagesForYahoo;
    const dataLanguagesForYahooThirdArray = dataLanguagesForYahoo.filter(
      (secondObj) =>
        !allLanguages.some(
          (firstObj) => firstObj.code === secondObj.language_code,
        ),
    );

    await repository.save(
      dataLanguagesForYahooThirdArray.map((item) => {
        return {
          code: item.language_code,
          name: item.language_name,
          serpYahoo: true,
        };
      }),
    );

    allLanguages = await repository.find();
    const dataLanguagesForBaidu = await languagesForBaidu;
    const dataLanguagesForBaiduThirdArray = dataLanguagesForBaidu.filter(
      (secondObj) =>
        !allLanguages.some(
          (firstObj) => firstObj.code === secondObj.language_code,
        ),
    );

    await repository.save(
      dataLanguagesForBaiduThirdArray.map((item) => {
        return {
          code: item.language_code,
          name: item.language_name,
          serpBaidu: true,
        };
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
