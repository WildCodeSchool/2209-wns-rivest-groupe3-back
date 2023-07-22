import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveBlogCommentRelation1690014476982 implements MigrationInterface {
    name = 'RemoveBlogCommentRelation1690014476982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_5dec255234c5b7418f3d1e88ce4"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "blogId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "blogId" uuid`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_5dec255234c5b7418f3d1e88ce4" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
