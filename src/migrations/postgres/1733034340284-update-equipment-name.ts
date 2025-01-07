import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEquipmentName1733034340284 implements MigrationInterface {
    name = 'UpdateEquipmentName1733034340284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bosch"."equipment" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bosch"."equipment" DROP COLUMN "name"`);
    }

}
