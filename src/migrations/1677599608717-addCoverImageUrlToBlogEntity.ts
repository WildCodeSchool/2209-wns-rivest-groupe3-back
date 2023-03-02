import { MigrationInterface, QueryRunner } from "typeorm";

export class addCoverImageUrlToBlogEntity1677599608717 implements MigrationInterface {
    name = 'addCoverImageUrlToBlogEntity1677599608717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" ADD "coverUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "coverUrl"`);
    }

}
