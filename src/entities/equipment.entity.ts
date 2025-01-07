import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { EquipmentReport } from "./report.entity";

export enum EquipmentType {
  BOSCH = "BOSCH",
  External = "EXTERNAL",
}

export enum EquipmentStatus {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

@Entity("equipment")
@Unique(["equipmentNumber"])
export class Equipment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: EquipmentType,
  })
  type!: EquipmentType;

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

  @Column({
    type: "enum",
    enum: EquipmentStatus,
  })
  status!: EquipmentStatus;

  @OneToMany(() => EquipmentReport, (report) => report.equipment)
  equipmentReports: EquipmentReport[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}
