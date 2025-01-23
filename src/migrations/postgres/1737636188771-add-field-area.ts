import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldArea1737636188771 implements MigrationInterface {
  name = "AddFieldArea1737636188771";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bosch"."equipment" ADD "area" text`);
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment-report" ADD "area" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment-report" DROP COLUMN "area"`
    );
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment" DROP COLUMN "area"`
    );
  }
}
