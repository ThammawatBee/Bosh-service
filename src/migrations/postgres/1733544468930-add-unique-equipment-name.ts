import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueEquipmentName1733544468930 implements MigrationInterface {
  name = 'AddUniqueEquipmentName1733544468930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment" ADD CONSTRAINT "UQ_c68ee9ccd3d3a26e81abb0df390" UNIQUE ("equipment_number")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bosch"."equipment" DROP CONSTRAINT "UQ_c68ee9ccd3d3a26e81abb0df390"`);
  }
}
