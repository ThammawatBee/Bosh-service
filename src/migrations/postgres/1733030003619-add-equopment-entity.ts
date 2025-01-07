import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEquopmentEntity1733030003619 implements MigrationInterface {
    name = 'AddEquopmentEntity1733030003619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "bosch"."equipment_type_enum" AS ENUM('BOSCH', 'External')`);
        await queryRunner.query(`CREATE TYPE "bosch"."equipment_status_enum" AS ENUM('ENABLE', 'DISABLE')`);
        await queryRunner.query(`CREATE TABLE "bosch"."equipment" ("id" uuid NOT NULL, "type" "bosch"."equipment_type_enum" NOT NULL, "brand" character varying NOT NULL, "inspection_period" integer NOT NULL, "next_inspection" TIMESTAMP WITH TIME ZONE NOT NULL, "expired_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "bosch"."equipment_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0722e1b9d6eb19f5874c1678740" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bosch"."equipment"`);
        await queryRunner.query(`DROP TYPE "bosch"."equipment_status_enum"`);
        await queryRunner.query(`DROP TYPE "bosch"."equipment_type_enum"`);
    }

}
