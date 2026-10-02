import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateMessageTable1790933409481 implements MigrationInterface {
  name = 'CreateMessageTable1790933409481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` CHANGE \`parentId\` \`parentId\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` CHANGE \`deletedBy\` \`deletedBy\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_7d473d0de3669832052cac98b98\` FOREIGN KEY (\`parentId\`) REFERENCES \`messages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_2db9cf2b3ca111742793f6c37ce\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_1333e7187bc72bf4828520fe52a\` FOREIGN KEY (\`deletedBy\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_1333e7187bc72bf4828520fe52a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_2db9cf2b3ca111742793f6c37ce\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_7d473d0de3669832052cac98b98\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` CHANGE \`deletedBy\` \`deletedBy\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` CHANGE \`parentId\` \`parentId\` varchar(255) NOT NULL`,
    );
  }
}
