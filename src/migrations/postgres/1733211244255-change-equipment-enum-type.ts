import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEquipmentEnumType1733211244255 implements MigrationInterface {
  name = 'ChangeEquipmentEnumType1733211244255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "bosch"."equipment_type_enum" RENAME TO "equipment_type_enum_old"`);
    await queryRunner.query(`CREATE TYPE "bosch"."equipment_type_enum" AS ENUM('BOSCH', 'EXTERNAL')`);
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment" ALTER COLUMN "type" TYPE "bosch"."equipment_type_enum" USING "type"::"text"::"bosch"."equipment_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "bosch"."equipment_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "bosch"."equipment_type_enum_old" AS ENUM('BOSCH', 'External')`);
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment" ALTER COLUMN "type" TYPE "bosch"."equipment_type_enum_old" USING "type"::"text"::"bosch"."equipment_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "bosch"."equipment_type_enum"`);
    await queryRunner.query(`ALTER TYPE "bosch"."equipment_type_enum_old" RENAME TO "equipment_type_enum"`);
  }
}
