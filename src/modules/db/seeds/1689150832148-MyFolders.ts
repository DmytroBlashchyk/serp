import { MigrationInterface, QueryRunner } from 'typeorm';
import { FolderEntity } from 'modules/folders/entities/folder.entity';

export class MyFolders1689150832148 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(FolderEntity, { name: 'My Folders' });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rootFolder = await queryRunner.manager.findOne(FolderEntity, {
      where: { name: 'My Folders' },
    });
    await queryRunner.manager.remove(rootFolder);
  }
}
