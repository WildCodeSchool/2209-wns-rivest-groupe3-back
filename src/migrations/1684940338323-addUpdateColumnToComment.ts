import { MigrationInterface, QueryRunner } from "typeorm";

export class addUpdateColumnToComment1684940338323 implements MigrationInterface {
    name = 'addUpdateColumnToComment1684940338323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "updatedAt"`);
    }

}
