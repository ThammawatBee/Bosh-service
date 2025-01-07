import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEquipment1733030293944 implements MigrationInterface {
  name = 'UpdateEquipment1733030293944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bosch"."equipment" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bosch"."equipment" ALTER COLUMN "id" DROP DEFAULT`);
  }
}
