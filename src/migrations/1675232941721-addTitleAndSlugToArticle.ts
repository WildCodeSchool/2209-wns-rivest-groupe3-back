import { MigrationInterface, QueryRunner } from "typeorm";

export class addTitleAndSlugToArticle1675232941721 implements MigrationInterface {
    name = 'addTitleAndSlugToArticle1675232941721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "article" ADD "slug" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "title"`);
    }

}
