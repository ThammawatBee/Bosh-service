import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Equipment } from "./equipment.entity";

export enum ReportResult {
  OK = "OK",
  NOK = "NOK",
}

export enum ReportEquipmentType {
  BOSCH = "BOSCH",
  External = "EXTERNAL",
}

@Entity("equipment-report")
export class EquipmentReport {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ReportResult,
  })
  result!: ReportResult;

  @Column({
    nullable: false,
    type: "timestamptz",
  })
  resultDate: Date;

  @Column({
    type: "enum",
    enum: ReportEquipmentType,
  })
  type!: ReportEquipmentType;

  @Column({ type: "varchar", nullable: false })
  equipmentNumber!: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ name: "brand", type: "varchar", nullable: false })
  brand!: string;

  @Column({ type: "integer", nullable: false })
  inspectionPeriod!: number;

  @Column({
    nullable: false,
    type: "timestamptz",
  })
  nextInspection: Date;

  @Column({
    nullable: false,
    type: "timestamptz",
  })
  expiredDate: Date;

  @Column("uuid")
  equipmentId: string;

  @Column({ type: "text", nullable: true })
  nokReason: string;

  @Column({ type: "text", nullable: true })
  investigatedBy: string;

  @ManyToOne(() => Equipment, (equipment) => equipment.equipmentReports)
  @JoinColumn({ name: "equipment_id" })
  equipment: Equipment;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}
