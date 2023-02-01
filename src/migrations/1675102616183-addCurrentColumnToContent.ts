import { MigrationInterface, QueryRunner } from "typeorm";

export class addCurrentColumnToContent1675102616183 implements MigrationInterface {
    name = 'addCurrentColumnToContent1675102616183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content" ADD "current" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content" DROP COLUMN "current"`);
    }

}
