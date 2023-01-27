import { MigrationInterface, QueryRunner } from 'typeorm'

export class init1674755070066 implements MigrationInterface {
  name = 'init1674755070066'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "content" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" json NOT NULL, "version" integer NOT NULL, "articleId" uuid, CONSTRAINT "PK_6a2083913f3647b44f205204e36" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" character varying NOT NULL, "articleId" uuid, "userId" uuid, "blogId" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "postedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "show" boolean NOT NULL, "country" character varying, "version" integer NOT NULL, "blogId" uuid, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "blog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "template" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_ac8995bfa676a3a49a23fd8fe9c" UNIQUE ("name"), CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "nickname" character varying NOT NULL, "password" character varying NOT NULL, "city" character varying, "firstName" character varying, "lastName" character varying, "description" character varying, "avatar" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastLogin" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_e2364281027b926b879fa2fa1e0" UNIQUE ("nickname"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "article_categories_category" ("articleId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_a8116c8896d1d576d6ea7ad0d3c" PRIMARY KEY ("articleId", "categoryId"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_4ba35bcb36b2715f61faa696c7" ON "article_categories_category" ("articleId") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_5d9199768aa2bd9f91d175dc6d" ON "article_categories_category" ("categoryId") `
    )
    await queryRunner.query(
      `CREATE TABLE "article_tags_tag" ("articleId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_25290137c7f85b582eea2bc470d" PRIMARY KEY ("articleId", "tagId"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_9b7dd28292e2799512cd70bfd8" ON "article_tags_tag" ("articleId") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_5fee2a10f8d6688bd2f2c50f15" ON "article_tags_tag" ("tagId") `
    )
    await queryRunner.query(
      `ALTER TABLE "content" ADD CONSTRAINT "FK_ae4cf5971a967551d3953fa4045" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c20404221e5c125a581a0d90c0e" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_5dec255234c5b7418f3d1e88ce4" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "article" ADD CONSTRAINT "FK_35206678943850045da0f6dcbf2" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "blog" ADD CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "article_categories_category" ADD CONSTRAINT "FK_4ba35bcb36b2715f61faa696c7e" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "article_categories_category" ADD CONSTRAINT "FK_5d9199768aa2bd9f91d175dc6d1" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "article_tags_tag" ADD CONSTRAINT "FK_9b7dd28292e2799512cd70bfd81" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "article_tags_tag" ADD CONSTRAINT "FK_5fee2a10f8d6688bd2f2c50f15e" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_tags_tag" DROP CONSTRAINT "FK_5fee2a10f8d6688bd2f2c50f15e"`
    )
    await queryRunner.query(
      `ALTER TABLE "article_tags_tag" DROP CONSTRAINT "FK_9b7dd28292e2799512cd70bfd81"`
    )
    await queryRunner.query(
      `ALTER TABLE "article_categories_category" DROP CONSTRAINT "FK_5d9199768aa2bd9f91d175dc6d1"`
    )
    await queryRunner.query(
      `ALTER TABLE "article_categories_category" DROP CONSTRAINT "FK_4ba35bcb36b2715f61faa696c7e"`
    )
    await queryRunner.query(
      `ALTER TABLE "blog" DROP CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d"`
    )
    await queryRunner.query(
      `ALTER TABLE "article" DROP CONSTRAINT "FK_35206678943850045da0f6dcbf2"`
    )
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_5dec255234c5b7418f3d1e88ce4"`
    )
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`
    )
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c20404221e5c125a581a0d90c0e"`
    )
    await queryRunner.query(
      `ALTER TABLE "content" DROP CONSTRAINT "FK_ae4cf5971a967551d3953fa4045"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5fee2a10f8d6688bd2f2c50f15"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b7dd28292e2799512cd70bfd8"`
    )
    await queryRunner.query(`DROP TABLE "article_tags_tag"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d9199768aa2bd9f91d175dc6d"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4ba35bcb36b2715f61faa696c7"`
    )
    await queryRunner.query(`DROP TABLE "article_categories_category"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TABLE "blog"`)
    await queryRunner.query(`DROP TABLE "article"`)
    await queryRunner.query(`DROP TABLE "tag"`)
    await queryRunner.query(`DROP TABLE "category"`)
    await queryRunner.query(`DROP TABLE "comment"`)
    await queryRunner.query(`DROP TABLE "content"`)
  }
}
