import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateMessageTable1790937989905 implements MigrationInterface {
  name = 'CreateMessageTable1790937989905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`messages\` (\`id\` varchar(36) NOT NULL, \`inboxId\` varchar(255) NOT NULL, \`parentId\` varchar(255) NULL, \`content\` text NOT NULL, \`contentType\` varchar(20) NOT NULL DEFAULT 'text/plain', \`senderId\` varchar(255) NOT NULL, \`sentAt\` timestamp NOT NULL, \`updatedAt\` timestamp NULL, \`deletedAt\` timestamp NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_4da8fd46970fe8d74c7fbf03cd1\` FOREIGN KEY (\`inboxId\`) REFERENCES \`inboxes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_4da8fd46970fe8d74c7fbf03cd1\``,
    );
    await queryRunner.query(`DROP TABLE \`messages\``);
  }
}
