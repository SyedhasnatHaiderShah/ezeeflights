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
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRbacGuard, AdminPermission } from '../admin/rbac.middleware';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { UsaMarkupService } from './usa-markup.service';
import { CreateUsaMarkupDto } from './dto/create-usa-markup.dto';
import { UpdateUsaMarkupDto } from './dto/update-usa-markup.dto';

@ApiTags('Admin — Spanish Jetcost Markups')
@Controller({ path: 'admin/usa-markup', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class UsaMarkupController {
  private readonly logger = new Logger(UsaMarkupController.name);

  constructor(private readonly service: UsaMarkupService) {}

  @ApiOperation({ summary: 'Get Spanish Jetcost status' })
  @ApiResponse({ status: 200, description: 'Get running status' })
  @AdminPermission('FLIGHTS.MARKUP', AdminPermissionAction.READ)
  @Get('status')
  async getStatus() {
    try {
      const status = await this.service.getRunningStatus();
      return { status };
    } catch (error: any) {
      this.logger.error(`[getStatus] Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get running status');
    }
  }

  @ApiOperation({ summary: 'Update Spanish Jetcost status' })
  @ApiResponse({ status: 200, description: 'Update running status' })
  @AdminPermission('FLIGHTS.MARKUP', AdminPermissionAction.WRITE)
  @Post('status')
  async updateStatus(@Body() body: { status: string }) {
    try {
      await this.service.updateRunningStatus(body.status);
      return { success: true, status: body.status };
    } catch (error: any) {
      this.logger.error(`[updateStatus] Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update running status');
    }
  }

  @ApiOperation({ summary: 'List all Spanish Jetcost markup rules (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of markup rules' })
  @AdminPermission('FLIGHTS.MARKUP', AdminPermissionAction.READ)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      return await this.service.findAll(Number(page), Number(limit));
    } catch (error: any) {
      this.logger.error(`[findAll] Error: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch USA markups');
    }
  }

  @ApiOperation({ summary: 'Create a new Spanish Jetcost markup rule' })
  @ApiResponse({ status: 201, description: 'Created markup rule' })
  @AdminPermission('FLIGHTS.MARKUP', AdminPermissionAction.WRITE)
  @Post()
  async create(@Body() dto: CreateUsaMarkupDto) {
    try {
      return await this.service.create(dto);
    } catch (error: any) {
      this.logger.error(`[create] Error: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create USA markup');
    }
  }

  @ApiOperation({ summary: 'Update a markup rule (full or partial)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Updated markup rule' })
  @AdminPermission('FLIGHTS.MARKUP', AdminPermissionAction.WRITE)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsaMarkupDto,
  ) {
    try {
      return await this.service.update(id, dto);
    } catch (error: any) {
      this.logger.error(`[update] Error: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to update USA markup #${id}`);
    }
  }

  @ApiOperation({ summary: 'Soft-delete a markup rule' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Markup rule deleted' })
  @AdminPermission('FLIGHTS.MARKUP', AdminPermissionAction.WRITE)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.remove(id);
    } catch (error: any) {
      this.logger.error(`[remove] Error: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(`Failed to delete USA markup #${id}`);
    }
  }
}
