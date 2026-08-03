import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenToUser1783938534197 implements MigrationInterface {
    name = 'AddRefreshTokenToUser1783938534197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`refreshToken\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`refreshToken\``);
    }

}
