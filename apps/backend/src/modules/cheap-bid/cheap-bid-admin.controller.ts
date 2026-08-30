import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminRbacGuard, AdminPermission } from "../admin/rbac.middleware";
import { AdminPermissionAction } from "../admin/dto/admin.dto";
import { CheapBidService } from "./cheap-bid.service";
import { CreateCheapBidDto } from "./dto/create-cheap-bid.dto";
import { UpdateCheapBidDto } from "./dto/update-cheap-bid.dto";

@ApiTags("Admin — Cheap Bid")
@Controller({ path: "admin/cheap-bid", version: "1" })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class CheapBidAdminController {
  constructor(private readonly service: CheapBidService) {}

  @ApiOperation({ summary: "List cheap bid offers (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.READ)
  @Get()
  findAll(@Query("page") page = 1, @Query("limit") limit = 20) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @ApiOperation({ summary: "Get cheap bid status" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.READ)
  @Get("status")
  async getStatus() {
    const status = await this.service.getRunningStatus();
    return { status };
  }

  @ApiOperation({ summary: "Update cheap bid status" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Post("status")
  async updateStatus(@Body() body: { status: string }) {
    await this.service.updateRunningStatus(body.status);
    return { success: true, status: body.status };
  }

  @ApiOperation({ summary: "Upload cheap bid offers from Excel" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @UseInterceptors(FileInterceptor("file"))
  @Post("upload")
  async upload(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("No Excel file uploaded.");
    }
    const result = await this.service.importFromExcel(file.buffer);
    if (!result.success) {
      throw new BadRequestException({
        message: "Failed to import cheap bids from Excel.",
        errors: result.errors,
      });
    }
    
    let message = `Successfully imported ${result.count} cheap bids!`;
    if (result.skippedCount > 0) {
      message += ` (${result.skippedCount} identical offers were already present and skipped.)`;
    }
    if (result.errors.length > 0) {
      message += ` Note: ${result.errors.length} row(s) failed:\n` + result.errors.slice(0, 10).join("\n") + (result.errors.length > 10 ? "\n...and more" : "");
    }
    
    return {
      success: true,
      count: result.count,
      skippedCount: result.skippedCount,
      errors: result.errors,
      message,
    };
  }

  @ApiOperation({ summary: "Get cheap bid offer by id" })
  @ApiParam({ name: "id", type: Number })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.READ)
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @ApiOperation({ summary: "Clear flight search cache" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Post("clear-cache")
  clearCache() {
    return this.service.clearCache();
  }

  @ApiOperation({ summary: "Create a cheap bid offer" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Post()
  create(@Body() dto: CreateCheapBidDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: "Update a cheap bid offer" })
  @ApiParam({ name: "id", type: Number })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCheapBidDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: "Delete a cheap bid offer" })
  @ApiParam({ name: "id", type: Number })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { success: true, id };
  }

  @ApiOperation({ summary: "Delete ALL cheap bid offers" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Delete()
  async deleteAll() {
    return this.service.deleteAll();
  }

  @ApiOperation({ summary: "Delete selected cheap bid offers by IDs" })
  @AdminPermission("FLIGHTS.MARKUP", AdminPermissionAction.WRITE)
  @Post("bulk-delete")
  async deleteBulk(@Body() body: { ids: number[] }) {
    return this.service.deleteBulk(body.ids ?? []);
  }
}
