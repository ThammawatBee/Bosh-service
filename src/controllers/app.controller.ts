import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { AppService } from "../services/app.service";
import { Response } from "express";
import {
  CreateEquipment,
  CreateReport,
  EditEquipment,
  ListEquipment,
  ListInspectionEquipment,
  ListReport,
} from "src/schema/zod";
import { stringify } from "csv-stringify";
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get("/check-status")
  checkStatus() {
    return { status: "Service is online" };
  }

  @Post("/test")
  test(@Body() body: CreateEquipment) {
    const message = this.appService.getHello();
    return { message };
  }

  @Get("/reports/export")
  async exportReports(@Res() res: Response, @Query() query: ListReport) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="reports.csv"');
    res.write("\uFEFF");
    await this.appService.exportReports(query, res);
  }

  @Get("/reports")
  async listReports(@Query() query: ListReport) {
    const { reports, count } = await this.appService.listReports(query);
    return { reports, count };
  }

  @Post("/report")
  async createReport(@Body() body: CreateReport) {
    await this.appService.createReports(body);
    return { status: "Create report success" };
  }

  @Patch("/equipment/expired-date")
  async checkEquipmentExpiredDate() {
    await this.appService.checkEquipmentExpiredDate();
    return { status: "Check expired date success" };
  }

  @Patch("/equipment/:id")
  async editEquipment(@Param("id") id: string, @Body() body: EditEquipment) {
    const equipment = await this.appService.editEquipment(id, body);
    return { equipment };
  }

  @Post("/equipment")
  async createEquipment(@Body() body: CreateEquipment) {
    const equipment = await this.appService.createEquipment(body);
    return { equipment };
  }

  @Get("/inspection-equipments")
  async listInspectionEquipments(@Query() query: ListInspectionEquipment) {
    const { equipments, count } = await this.appService.listInspectionEquipment(
      query
    );
    return { equipments, count };
  }

  @Get("/inspection-equipments/export")
  async exportInspectionEquipments(
    @Res() res: Response,
    @Query() query: ListInspectionEquipment
  ) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="equipments.csv"'
    );
    res.write("\uFEFF");
    await this.appService.exportInspectionEquipment(query, res);
  }

  @Get("/equipments")
  async listEquipments(@Query() query: ListEquipment) {
    const { equipments, count } = await this.appService.listEquipment(query);
    return { equipments, count };
  }

  @Get("/equipments/export")
  async exportEquipments(@Res() res: Response, @Query() query: ListEquipment) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="equipments.csv"'
    );
    res.write("\uFEFF");
    await this.appService.exportEquipment(query, res);
  }

  @Get("/large-csv")
  async exportLargeCsv(@Res() res: Response) {
    // Simulated large JSON array
    const data = Array.from({ length: 1000000 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
    }));

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');

    res.write("\uFEFF"); // UTF-8 BOM
    // Stream JSON to CSV
    const csvStream = stringify({
      header: true,
      columns: ["id", "name", "email"], // Define CSV columns
    });

    // Write data to the stream in chunks
    for (const item of data) {
      csvStream.write(item);
    }

    csvStream.end(); // End the stream when all data is written

    csvStream.pipe(res); // Pipe the CSV stream to the response
  }

  @Post("/equipment/generate")
  async generateEquipment(@Body() body: any) {
    this.appService.generateEquipment(
      body?.generateCount || 10,
      body?.startDate,
      body?.endDate
    );
    return { status: "Generate equipment success" };
  }
}
