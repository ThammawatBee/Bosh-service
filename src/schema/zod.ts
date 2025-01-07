import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";
import { DateTime } from "luxon";
import { EquipmentStatus } from "src/entities/equipment.entity";

const CredentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// class is required for using DTO as a type
export class CredentialsDto extends createZodDto(CredentialsSchema) { }

const CreateEquipmentSchema = z
  .object({
    type: z.enum(["BOSCH", "EXTERNAL"]),
    equipmentNumber: z.string(),
    name: z.string(),
    brand: z.string(),
    inspectionPeriod: z.number().int(),
    nextInspection: z.string().refine(
      (nextInspection) => {
        return DateTime.fromFormat(nextInspection, "dd-MM-yyyy").isValid;
      },
      { message: "NextInspection is invalid date" }
    ),
    expiredDate: z.string().refine(
      (expiredDate) => {
        const date = DateTime.fromFormat(expiredDate, "dd-MM-yyyy");
        return date.isValid;
      },
      { message: "expiredDate is invalid date" }
    ),
    status: z.enum([EquipmentStatus.ENABLE, EquipmentStatus.DISABLE]),
  })
  .refine(
    (equipment) => {
      return (
        DateTime.fromFormat(equipment.nextInspection, "dd-MM-yyyy") <
        DateTime.fromFormat(equipment.expiredDate, "dd-MM-yyyy")
      );
    },
    { message: "ExpiredDate must after nextInspection" }
  );

export class CreateEquipment extends createZodDto(CreateEquipmentSchema) { }

const EditEquipmentSchema = z
  .object({
    name: z.string(),
    brand: z.string(),
    equipmentNumber: z.string(),
    nextInspection: z.string().refine(
      (nextInspection) => {
        return DateTime.fromFormat(nextInspection, "dd-MM-yyyy").isValid;
      },
      { message: "NextInspection is invalid date" }
    ),
    expiredDate: z.string().refine(
      (expiredDate) => {
        const date = DateTime.fromFormat(expiredDate, "dd-MM-yyyy");
        return date.isValid;
      },
      { message: "expiredDate is invalid date" }
    ),
    inspectionPeriod: z.number().int(),
    status: z.enum([EquipmentStatus.ENABLE, EquipmentStatus.DISABLE]),
  })
  .strict()
  .refine(
    (equipment) => {
      return (
        DateTime.fromFormat(equipment.nextInspection, "dd-MM-yyyy") <
        DateTime.fromFormat(equipment.expiredDate, "dd-MM-yyyy")
      );
    },
    { message: "ExpiredDate must after nextInspection" }
  );

export class EditEquipment extends createZodDto(EditEquipmentSchema) { }

const CreateReportSchema = z.object({
  equipmentNumber: z.string(),
  result: z.enum(["OK", "NOK"]),
  resultDate: z.string().refine(
    (resultDate) => {
      return DateTime.fromFormat(resultDate, "dd-MM-yyyy").isValid;
    },
    { message: "resultDate is invalid date" }
  ),
  nokReason: z.string().optional(),
  investigatedBy: z.string().optional(),
});

export class CreateReport extends createZodDto(
  z.object({ reports: z.array(CreateReportSchema) })
) {}

const ListEquipmentSchema = z.object({
  type: z.enum(["BOSCH", "EXTERNAL"]).optional(),
  equipmentNumber: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  status: z.string().optional(),
  inspectionDayStart: z.string().optional(),
  inspectionDayEnd: z.string().optional(),
  expiredDayStart: z.string().optional(),
  expiredDayEnd: z.string().optional(),
  offset: z.string().optional(),
  limit: z.string().optional(),
});

export class ListEquipment extends createZodDto(ListEquipmentSchema) { }

const ListInspectionEquipmentSchema = z.object({
  type: z.enum(["BOSCH", "EXTERNAL"]).optional(),
  equipmentNumber: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  status: z.string().optional(),
  offset: z.string().optional(),
  limit: z.string().optional(),
  inspectDate: z.string().optional(),
});

export class ListInspectionEquipment extends createZodDto(
  ListInspectionEquipmentSchema
) { }

const ListReportSchema = z.object({
  type: z.enum(["BOSCH", "EXTERNAL"]).optional(),
  equipmentNumber: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  result: z.string().optional(),
  offset: z.string().optional(),
  limit: z.string().optional(),
  resultDateStart: z.string().optional(),
  resultDateEnd: z.string().optional(),
});

export class ListReport extends createZodDto(ListReportSchema) { }
