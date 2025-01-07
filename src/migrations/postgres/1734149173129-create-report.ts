import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReport1734149173129 implements MigrationInterface {
  name = "CreateReport1734149173129";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "bosch"."equipment-report_result_enum" AS ENUM('OK', 'NOK')`
    );
    await queryRunner.query(
      `CREATE TYPE "bosch"."equipment-report_type_enum" AS ENUM('BOSCH', 'EXTERNAL')`
    );
    await queryRunner.query(
      `CREATE TABLE "bosch"."equipment-report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "result" "bosch"."equipment-report_result_enum" NOT NULL, "result_date" TIMESTAMP WITH TIME ZONE NOT NULL, "type" "bosch"."equipment-report_type_enum" NOT NULL, "equipment_number" character varying NOT NULL, "name" character varying NOT NULL, "brand" character varying NOT NULL, "inspection_period" integer NOT NULL, "next_inspection" TIMESTAMP WITH TIME ZONE NOT NULL, "expired_date" TIMESTAMP WITH TIME ZONE NOT NULL, "equipment_id" uuid NOT NULL, "nok_reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e45f93af5eb977aa075d4264a6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment-report" ADD CONSTRAINT "FK_a15c526634017e40ed2d8079eef" FOREIGN KEY ("equipment_id") REFERENCES "bosch"."equipment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bosch"."equipment-report" DROP CONSTRAINT "FK_a15c526634017e40ed2d8079eef"`
    );
    await queryRunner.query(`DROP TABLE "bosch"."equipment-report"`);
    await queryRunner.query(`DROP TYPE "bosch"."equipment-report_type_enum"`);
    await queryRunner.query(`DROP TYPE "bosch"."equipment-report_result_enum"`);
  }
}
