import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoverUrlToArticle1682597817711 implements MigrationInterface {
    name = 'AddCoverUrlToArticle1682597817711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "coverUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "coverUrl"`);
    }

}
