import { MigrationInterface, QueryRunner } from "typeorm";

export class addSubscriptionUserBlogEntity1677794962901 implements MigrationInterface {
    name = 'addSubscriptionUserBlogEntity1677794962901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_user_blog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "blogId" uuid, "userId" uuid, CONSTRAINT "PK_08a1f63767c5434a52b17030106" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscription_user_blog" ADD CONSTRAINT "FK_8f1d78cd44e3e74d9bbda7a68f6" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription_user_blog" ADD CONSTRAINT "FK_facfc5ea0ff71d99f9ac400975f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_user_blog" DROP CONSTRAINT "FK_facfc5ea0ff71d99f9ac400975f"`);
        await queryRunner.query(`ALTER TABLE "subscription_user_blog" DROP CONSTRAINT "FK_8f1d78cd44e3e74d9bbda7a68f6"`);
        await queryRunner.query(`DROP TABLE "subscription_user_blog"`);
    }

}
