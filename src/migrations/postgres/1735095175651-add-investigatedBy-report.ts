import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvestigatedByReport1735095175651
  implements MigrationInterface
{
  name = "AddInvestigatedByReport1735095175651";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment-report" ADD "investigated_by" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment-report" DROP COLUMN "investigated_by"`
    );
  }
}
