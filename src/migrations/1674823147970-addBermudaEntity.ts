import { MigrationInterface, QueryRunner } from "typeorm";

export class addBermudaEntity1674823147970 implements MigrationInterface {
    name = 'addBermudaEntity1674823147970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bermuda" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_78aac6569e48fbb2316b335db33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bermuda" ADD CONSTRAINT "FK_40507c7de013b10f5e9d3d34d4d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bermuda" DROP CONSTRAINT "FK_40507c7de013b10f5e9d3d34d4d"`);
        await queryRunner.query(`DROP TABLE "bermuda"`);
    }

}
