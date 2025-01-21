import {
  HttpException,
  HttpStatus,
  Injectable,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { Brackets, In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Equipment,
  EquipmentStatus,
  EquipmentType,
} from "src/entities/equipment.entity";
import { DateTime, Settings } from "luxon";
import {
  CreateReport,
  EditEquipment,
  ListEquipment,
  ListInspectionEquipment,
  ListReport,
} from "src/schema/zod";
import { Writable } from "stream";
import { stringify } from "csv-stringify";
import {
  EquipmentReport,
  ReportEquipmentType,
  ReportResult,
} from "src/entities/report.entity";
import keyBy from "lodash/keyBy";
import chunk from "lodash/chunk";
import { Cron } from "@nestjs/schedule";

Settings.defaultZone = "Asia/Bangkok";

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(EquipmentReport)
    private readonly reportRepository: Repository<EquipmentReport>
  ) { }
  getHello(): string {
    return "Hello World!";
  }

  getHealth(): object {
    return { status: "UP" };
  }

  public async editEquipment(id: string, editData: EditEquipment) {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ["equipmentReports"],
    });
    if (!equipment) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          errorKey: "NOT_FOUND_EQUIPMENT_TO_UPDATE",
        },
        HttpStatus.NOT_FOUND
      );
    }
    console.log("equipment", equipment);
    if (equipment?.equipmentReports?.length) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errorKey: "EQUIPMENT_IS_ALREADY_GENERATE_REPORT",
        },
        HttpStatus.BAD_REQUEST
      );
    }
    try {
      const updatedEquipment = await this.equipmentRepository.save({
        id,
        ...editData,
        status: editData.status,
        nextInspection: DateTime.fromFormat(
          editData.nextInspection,
          "dd-MM-yyyy"
        ).toJSDate(),
        expiredDate: DateTime.fromFormat(
          editData.expiredDate,
          "dd-MM-yyyy"
        ).toJSDate(),
      });
      return updatedEquipment;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          errorKey: "EDIT_EQUIPMENT_ERROR",
          error,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async createEquipment(data: any) {
    try {
      const equipment = await this.equipmentRepository.save({
        equipmentNumber: data.equipmentNumber,
        type: data.type,
        brand: data.brand,
        name: data.name,
        inspectionPeriod: +data.inspectionPeriod,
        nextInspection: DateTime.fromFormat(
          data.nextInspection,
          "dd-MM-yyyy"
        ).toJSDate(),
        expiredDate: DateTime.fromFormat(
          data.expiredDate,
          "dd-MM-yyyy"
        ).toJSDate(),
        status: data.status,
      });
      return equipment;
    } catch (error) {
      if (error?.routine === "_bt_check_unique") {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errorKey: "EQUIPMENT_NUMBER_IS_ALREADY_EXIST",
            error,
          },
          HttpStatus.BAD_REQUEST
        );
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errorKey: "CREATE_EQUIPMENT_ERROR",
            error,
          },
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }

  public async listEquipment(options: ListEquipment) {
    const query = this.equipmentRepository.createQueryBuilder("equipment");
    const {
      type,
      equipmentNumber,
      name,
      brand,
      status,
      inspectionDayStart,
      inspectionDayEnd,
      expiredDayStart,
      expiredDayEnd,
      offset,
      limit,
    } = options;
    if (type) {
      query.andWhere("equipment.type = :type", { type });
    }
    if (equipmentNumber) {
      query.andWhere(`equipment.equipmentNumber ilike '%${equipmentNumber}%'`);
    }
    if (name) {
      query.andWhere(`equipment.name ilike '%${name}%'`);
    }
    if (brand) {
      query.andWhere(`equipment.brand ilike '%${brand}%'`);
    }
    if (status) {
      query.andWhere("equipment.status = :status", { status });
    }
    if (inspectionDayStart && inspectionDayEnd) {
      query.andWhere(
        "equipment.nextInspection BETWEEN :inspectionDayStart AND :inspectionDayEnd",
        {
          inspectionDayStart: DateTime.fromFormat(
            inspectionDayStart,
            "dd-MM-yyyy"
          ).toJSDate(),
          inspectionDayEnd: DateTime.fromFormat(
            inspectionDayEnd,
            "dd-MM-yyyy"
          ).toJSDate(),
        }
      );
    }
    if (expiredDayStart && expiredDayEnd) {
      query.andWhere(
        "equipment.nextInspection BETWEEN :expiredDayStart AND :expiredDayEnd",
        {
          expiredDayStart: DateTime.fromFormat(
            expiredDayStart,
            "dd-MM-yyyy"
          ).toJSDate(),
          expiredDayEnd: DateTime.fromFormat(
            expiredDayEnd,
            "dd-MM-yyyy"
          ).toJSDate(),
        }
      );
    }
    const count = await query.getCount();
    query.orderBy("equipment.createdAt", "DESC");
    query.limit(+limit || 20);
    query.offset(+offset || 0);
    const equipments = await query.getMany();
    return { equipments, count };
  }

  public async listInspectionEquipment(options: ListInspectionEquipment) {
    const currentDate = options?.inspectDate
      ? DateTime.fromFormat(options?.inspectDate, "dd-MM-yyyy").toJSDate()
      : new Date(); // Current timestamp
    const fourteenDaysFromNow = currentDate;
    fourteenDaysFromNow.setDate(currentDate.getDate() + 14);
    const { type, equipmentNumber, name, brand, offset, limit } = options;
    const query = this.equipmentRepository
      .createQueryBuilder("equipment")
      .andWhere(
        new Brackets((qb) => {
          qb.where("equipment.nextInspection < :currentDate", {
            currentDate: new Date(),
          }).orWhere(
            "equipment.nextInspection BETWEEN :currentDate AND :fourteenDaysFromNow",
            {
              currentDate,
              fourteenDaysFromNow,
            }
          );
        })
      );
    query.andWhere("equipment.status = :status", {
      status: EquipmentStatus.ENABLE,
    });
    if (type) {
      query.andWhere("equipment.type = :type", { type });
    }
    if (equipmentNumber) {
      query.andWhere(`equipment.equipmentNumber ilike '%${equipmentNumber}%'`);
    }
    if (name) {
      query.andWhere(`equipment.name ilike '%${name}%'`);
    }
    if (brand) {
      query.andWhere(`equipment.brand ilike '%${brand}%'`);
    }
    const count = await query.getCount();
    query.orderBy("equipment.createdAt", "DESC");
    query.limit(+limit || 20);
    query.offset(+offset || 0);
    const equipments = await query.getMany();
    return { equipments, count };
  }

  public async exportEquipment(
    options: ListEquipment,
    writableStream: Writable
  ) {
    const csvStream = stringify({
      header: true,
      columns: [
        "Type",
        "Equipment No.",
        "Name",
        "Brand",
        "Inspection Period",
        "Next Inspection",
        "Expired Date",
        "Status",
      ], // Define CSV columns
    });

    csvStream.pipe(writableStream);

    const batchSize = 5;
    let offset = 0;

    while (true) {
      // const equipments = await this.equipmentRepository.find({
      //   skip: offset,
      //   take: batchSize,
      // });
      const { equipments } = await this.listEquipment({
        ...options,
        offset: `${offset}`,
        limit: `${batchSize}`,
      });

      if (equipments.length === 0) break;

      for (const equipment of equipments) {
        csvStream.write({
          ["Type"]: equipment.type,
          ["Equipment No."]: equipment.equipmentNumber,
          ["Name"]: equipment.name,
          ["Brand"]: equipment.brand || "",
          ["Inspection Period"]: equipment.inspectionPeriod,
          ["Next Inspection"]: DateTime.fromISO(
            equipment.nextInspection.toISOString()
          ).toFormat("dd-MM-yyyy"),
          ["Expired Date"]: DateTime.fromISO(
            equipment.expiredDate.toISOString()
          ).toFormat("dd-MM-yyyy"),
          ["Status"]: equipment.status,
        });
      }

      offset += batchSize;
    }

    csvStream.end();
  }

  public async exportInspectionEquipment(
    options: ListInspectionEquipment,
    writableStream: Writable
  ) {
    const csvStream = stringify({
      header: true,
      quoted_string: true,
      columns: [
        "Remaining Days",
        "Type",
        "New Equipment No.",
        "Current Equipment No.",
        "Name",
        "Brand",
        "Inspection Period",
        "Next Inspection",
        "Expired Date",
      ], // Define CSV columns
    });

    csvStream.pipe(writableStream);

    const batchSize = 5;
    let offset = 0;
    const calculateDateDifferent = (equipment: Equipment) => {
      const diff = DateTime.fromISO(equipment.nextInspection.toISOString())
        .diff(DateTime.fromFormat(options.inspectDate, "dd-MM-yyyy"), "days")
        .toObject().days!;
      return diff > 0 ? Math.ceil(diff) : Math.ceil(diff);
    };

    const getCurrentEquipmentNo = (equipment: Equipment) => {
      return `${DateTime.fromFormat(options.inspectDate, "dd-MM-yyyy").toFormat(
        "ddMMyyyy"
      )}-${equipment.equipmentNumber.split("-")[1]}`;
    };

    while (true) {
      const { equipments } = await this.listInspectionEquipment({
        ...options,
        offset: `${offset}`,
        limit: `${batchSize}`,
      });

      if (equipments.length === 0) break;

      for (const equipment of equipments) {
        csvStream.write({
          ["Remaining Days"]: calculateDateDifferent(equipment),
          ["Type"]: equipment.type,
          ["New Equipment No."]: getCurrentEquipmentNo(equipment),
          ["Current Equipment No."]: equipment.equipmentNumber,
          ["Name"]: `${equipment.name}`.padStart(2, "0"),
          ["Brand"]: `${equipment.brand}`.padStart(2, "0"),
          ["Inspection Period"]: equipment.inspectionPeriod,
          ["Next Inspection"]: DateTime.fromISO(
            equipment.nextInspection.toISOString()
          ).toFormat("dd-MM-yyyy"),
          ["Expired Date"]: DateTime.fromISO(
            equipment.expiredDate.toISOString()
          ).toFormat("dd-MM-yyyy"),
        });
      }

      offset += batchSize;
    }

    csvStream.end();
  }

  public async exportReports(options: ListReport, writableStream: Writable) {
    const csvStream = stringify({
      header: true,
      quoted_string: true,
      columns: [
        "Result",
        "Type",
        "Result Date",
        "Staff Name",
        "Equipment No.",
        "Name",
        "Brand",
        "Inspection Period",
        "Next Inspection",
        "Expired Date",
        "NOK Reason",
      ], // Define CSV columns
    });

    csvStream.pipe(writableStream);
    const batchSize = 5;
    let offset = 0;

    while (true) {
      const { reports } = await this.listReports({
        ...options,
        offset: `${offset}`,
        limit: `${batchSize}`,
      });

      if (reports.length === 0) break;

      for (const report of reports) {
        csvStream.write({
          ["Result"]: report.result,
          ["Type"]: report.type,
          ["Result Date"]: DateTime.fromISO(
            report.resultDate.toISOString()
          ).toFormat("dd-MM-yyyy"),
          ["Staff Name"]: report.investigatedBy,
          ["Equipment No."]: report.equipmentNumber,
          ["Name"]: `${report.name}`.padStart(2, "0"),
          ["Brand"]: `${report.brand}`.padStart(2, "0"),
          ["Inspection Period"]: report.inspectionPeriod,
          ["Next Inspection"]: DateTime.fromISO(
            report.nextInspection.toISOString()
          ).toFormat("dd-MM-yyyy"),
          ["Expired Date"]: DateTime.fromISO(
            report.expiredDate.toISOString()
          ).toFormat("dd-MM-yyyy"),
          ["NOK Reason"]: report.nokReason,
        });
      }

      offset += batchSize;
    }

    csvStream.end();
  }

  public async createReports(payload: CreateReport) {
    const reports = payload.reports;
    let updateEquipments: Partial<Equipment>[] = [];
    let createReport: Partial<EquipmentReport>[] = [];
    let notFoundEquipment: string[] = [];
    const equipments = await this.equipmentRepository
      .createQueryBuilder("equipments")
      .leftJoin("equipments.equipmentReports", "reports")
      .where("equipments.equipmentNumber IN (:...equipmentNumbers)", {
        equipmentNumbers: reports.map((report) => report.equipmentNumber),
      })
      .andWhere("(reports.id IS NULL OR reports.result != :result)", {
        result: "NOK",
      })
      .getMany();
    const equipmentsKeyByEquipmentNumber = keyBy(equipments, "equipmentNumber");
    for (const report of reports) {
      if (equipmentsKeyByEquipmentNumber[report.equipmentNumber]) {
        const currentEquipment =
          equipmentsKeyByEquipmentNumber[report.equipmentNumber];
        const resultDate = DateTime.fromFormat(report.resultDate, "dd-MM-yyyy");
        if (report.result === "OK") {
          updateEquipments = [
            ...updateEquipments,
            {
              id: currentEquipment.id,
              equipmentNumber: `${resultDate.toFormat("ddMMyy")}-${
                currentEquipment.equipmentNumber.split("-")[1]
              }`,
              nextInspection: resultDate
                .plus({
                  months: Number(currentEquipment.inspectionPeriod),
                })
                .toJSDate(),
            },
          ];
        } else {
          updateEquipments = [
            ...updateEquipments,
            {
              id: currentEquipment.id,
              status: EquipmentStatus.DISABLE,
            },
          ];
        }
        createReport = [
          ...createReport,
          {
            result: report.result as ReportResult,
            resultDate: resultDate.toJSDate(),
            type: currentEquipment.type as any,
            equipmentNumber: currentEquipment.equipmentNumber,
            name: currentEquipment.name,
            brand: currentEquipment.brand,
            inspectionPeriod: currentEquipment.inspectionPeriod,
            nextInspection:
              report.result === "NOK"
                ? currentEquipment.nextInspection
                : resultDate
                    .plus({
                      months: Number(currentEquipment.inspectionPeriod),
                    })
                    .minus({ days: 1 })
                    .toJSDate(),
            expiredDate: currentEquipment.expiredDate,
            nokReason: report.result === "NOK" ? report.nokReason : null,
            equipmentId: currentEquipment.id,
            investigatedBy: report.investigatedBy,
          },
        ];
      } else {
        notFoundEquipment = [...notFoundEquipment, report.equipmentNumber];
      }
    }
    if (updateEquipments?.length) {
      const chunks = chunk(updateEquipments, 200);
      for (const chunk of chunks) {
        await this.equipmentRepository.save(chunk);
      }
    }
    if (createReport?.length) {
      const chunks = chunk(createReport, 200);
      for (const chunk of chunks) {
        await this.reportRepository.save(chunk);
      }
    }
  }

  async listReports(options: ListReport) {
    const {
      type,
      equipmentNumber,
      name,
      brand,
      result,
      resultDateEnd,
      resultDateStart,
      offset,
      limit,
    } = options;
    const query = this.reportRepository.createQueryBuilder("report");
    if (type) {
      query.andWhere("report.type = :type", { type });
    }
    if (equipmentNumber) {
      query.andWhere(`report.equipmentNumber ilike '%${equipmentNumber}%'`);
    }
    if (name) {
      query.andWhere(`report.name ilike '%${name}%'`);
    }
    if (brand) {
      query.andWhere(`report.brand ilike '%${brand}%'`);
    }
    if (result) {
      query.andWhere("report.result = :result", { result });
    }
    if (resultDateStart && resultDateEnd) {
      query.andWhere(
        "report.resultDate BETWEEN :resultDateStart AND :resultDateEnd",
        {
          resultDateStart: DateTime.fromFormat(
            resultDateStart,
            "dd-MM-yyyy"
          ).toJSDate(),
          resultDateEnd: DateTime.fromFormat(
            resultDateEnd,
            "dd-MM-yyyy"
          ).toJSDate(),
        }
      );
    }
    const count = await query.getCount();
    query.orderBy("report.createdAt", "DESC");
    query.limit(+limit || 20);
    query.offset(+offset || 0);
    const reports = await query.getMany();
    return { reports, count };
  }

  onApplicationBootstrap() {
    console.log("process.env", process.env.NODE_ENV);
    console.log("Application bootstrap complete!");
    this.runFunctionOnBootstrap();
  }

  async runFunctionOnBootstrap() {
    // Your function logic here
    console.log("Function executed after application bootstrap.");
  }

  async checkEquipmentExpiredDate() {
    const basequery = this.equipmentRepository
      .createQueryBuilder("equipment")
      .where("equipment.expiredDate < :currentDate", {
        currentDate: new Date(),
      })
      .andWhere("equipment.status = :status", {
        status: EquipmentStatus.ENABLE,
      });

    const count = await basequery.getCount();
    if (count > 100) {
      const pageSize = 100;
      const offset = 0;
      while (true) {
        const equipments = await basequery
          .select(["equipment.id"])
          .offset(offset)
          .limit(pageSize)
          .getMany();
        if (!equipments.length) {
          break;
        } else {
          await this.equipmentRepository.update(
            {
              id: In(equipments.map((equipment) => equipment.id)),
            },
            {
              status: EquipmentStatus.DISABLE,
            }
          );
        }
      }
    } else {
      await this.equipmentRepository
        .createQueryBuilder()
        .update(Equipment)
        .set({ status: EquipmentStatus.DISABLE })
        .where("expiredDate < :currentDate", {
          currentDate: new Date(),
        })
        .andWhere("equipment.status = :status", {
          status: EquipmentStatus.ENABLE,
        })
        .execute();
    }
  }
  //@Cron("*/1 * * * *")
  // @Cron('5 0 * * *')
  async handleCron() {
    // await this.checkEquipmentExpiredDate();
    console.log(
      `Check equipment expired date success at ${DateTime.now().toFormat(
        "dd-MM-yyyy HH:mm"
      )}`
    );
  }

  public async generateEquipment(
    generateCount: number,
    startDate?: string,
    endDate?: string
  ) {
    const generateString = () => {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randomLetter =
        alphabet[Math.floor(Math.random() * alphabet.length)];
      const randomDigits = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `${randomLetter}${randomDigits}`;
    };
    const generateRandomDate = () => {
      let start = new Date(2024, 0, 1).getTime(); // Start from January 1, 2024
      let end = new Date().getTime(); // Up to today
      if (startDate && endDate) {
        start = new Date(startDate).getTime();
        end = new Date(endDate).getTime();
      }
      const randomTimestamp = Math.floor(Math.random() * (end - start) + start);
      const randomDate = new Date(randomTimestamp);
      randomDate.setHours(0, 0, 0, 0);
      return randomDate;
    };

    let count = 0;
    let equipments: any[] = [];
    for (count; count < generateCount; count++) {
      const equipmentNumber = generateString();
      const randomDate = generateRandomDate();
      equipments.push({
        equipmentNumber: `${DateTime.fromJSDate(randomDate).toFormat(
          "ddMMyy"
        )}-${equipmentNumber}`,
        type: EquipmentType.BOSCH,
        brand: `brand-${equipmentNumber}`,
        name: `name-${equipmentNumber}`,
        inspectionPeriod: 3,
        nextInspection: DateTime.fromJSDate(randomDate)
          .plus({ months: 3 })
          .minus({ days: 1 })
          .toJSDate(),
        expiredDate: DateTime.fromJSDate(randomDate)
          .plus({ months: 12 })
          .toJSDate(),
        status: EquipmentStatus.ENABLE,
      });
      if (equipments?.length === 200) {
        await this.equipmentRepository.save(equipments);
        equipments = [];
      }
    }
    if (equipments?.length) {
      await this.equipmentRepository.save(equipments);
    }
  }
}
