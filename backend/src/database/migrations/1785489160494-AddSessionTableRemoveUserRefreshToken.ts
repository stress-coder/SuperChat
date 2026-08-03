import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSessionTableRemoveUserRefreshToken1785489160494 implements MigrationInterface {
  name = 'AddSessionTableRemoveUserRefreshToken1785489160494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`session\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`expiresAt\` timestamp NOT NULL, \`revokedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_session_userId\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`session\` ADD CONSTRAINT \`FK_session_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`refreshToken\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`refreshToken\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`session\` DROP FOREIGN KEY \`FK_session_userId\``);
    await queryRunner.query(`DROP TABLE \`session\``);
  }
}
