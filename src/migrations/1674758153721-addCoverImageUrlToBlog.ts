import { MigrationInterface, QueryRunner } from 'typeorm'

export class addCoverImageUrlToBlog1674758153721 implements MigrationInterface {
  name = 'addCoverImageUrlToBlog1674758153721'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog" ADD "coverImageUrl" character varying NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "coverImageUrl"`)
  }
}
