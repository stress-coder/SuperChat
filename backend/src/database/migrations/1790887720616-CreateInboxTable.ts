import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateInboxTable1790887720616 implements MigrationInterface {
  name = 'CreateInboxTable1790887720616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`inboxes\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NULL, \`type\` varchar(20) NOT NULL DEFAULT 'private', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NULL, \`updatedAt\` timestamp NULL, \`updatedBy\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`inboxes\` ADD CONSTRAINT \`FK_f7cb03e3cb23bed37b12739073a\` FOREIGN KEY (\`createdBy\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`inboxes\` ADD CONSTRAINT \`FK_884bfed747f4231750bc6570062\` FOREIGN KEY (\`updatedBy\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`inboxes\` DROP FOREIGN KEY \`FK_884bfed747f4231750bc6570062\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`inboxes\` DROP FOREIGN KEY \`FK_f7cb03e3cb23bed37b12739073a\``,
    );
    await queryRunner.query(`DROP TABLE \`inboxes\``);
  }
}
