import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateInboxUserTable1790887753551 implements MigrationInterface {
  name = 'CreateInboxUserTable1790887753551';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`inbox_users\` (\`id\` varchar(36) NOT NULL, \`inboxId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`nickname\` varchar(255) NULL, \`joinedAt\` timestamp NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'active', \`properties\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`inbox_users\` ADD CONSTRAINT \`FK_e1f32b91b5e4d45f3c9ddab7b1c\` FOREIGN KEY (\`inboxId\`) REFERENCES \`inboxes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`inbox_users\` ADD CONSTRAINT \`FK_13520b70da57ff2c3997e5d4b41\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`inbox_users\` DROP FOREIGN KEY \`FK_13520b70da57ff2c3997e5d4b41\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`inbox_users\` DROP FOREIGN KEY \`FK_e1f32b91b5e4d45f3c9ddab7b1c\``,
    );
    await queryRunner.query(`DROP TABLE \`inbox_users\``);
  }
}
