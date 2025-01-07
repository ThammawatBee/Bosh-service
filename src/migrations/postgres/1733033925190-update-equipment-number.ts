import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEquipmentNumber1733033925190 implements MigrationInterface {
    name = 'UpdateEquipmentNumber1733033925190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bosch"."equipment" ADD "equipment_number" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bosch"."equipment" DROP COLUMN "equipment_number"`);
    }

}
