import { Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TravelComplianceCheckDto, TravelDocumentShareDto, TravelDocumentUploadDto, TravelDocumentsQueryDto } from './travel-documents.dto';
import { TravelDocumentFile } from './travel-documents.entity';
import { TravelDocumentsService } from './travel-documents.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Travel Documents')
@Controller({ path: 'travel-documents', version: '1' })
export class TravelDocumentsController {
  constructor(private readonly service: TravelDocumentsService) {}

  @ApiOperation({ summary: 'List my travel documents' })
  @ApiResponse({ status: 200, description: 'Array of documents' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  listMyDocuments(@Req() req: AuthenticatedRequest, @Query() query: TravelDocumentsQueryDto) {
    return this.service.listMyDocuments(req.user.userId, query.bookingId, query.docType);
  }

  @ApiOperation({ summary: 'List booking documents for My Trips wallet' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Array of booking documents' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/:bookingId')
  listBookingDocuments(@Req() req: AuthenticatedRequest, @Param('bookingId') bookingId: string) {
    return this.service.listBookingDocuments(req.user.userId, bookingId);
  }

  @ApiOperation({ summary: 'Upload a travel document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: TravelDocumentUploadDto })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  upload(@Req() req: AuthenticatedRequest, @Body() dto: TravelDocumentUploadDto, @UploadedFile() file?: TravelDocumentFile) {
    return this.service.uploadDocument(req.user.userId, dto, file);
  }

  @ApiOperation({ summary: 'Scan a passport image and auto-fill passport fields' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'OCR result' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('passport/scan')
  scanPassport(@Req() req: AuthenticatedRequest, @UploadedFile() file?: TravelDocumentFile) {
    return this.service.scanPassport(req.user.userId, file);
  }

  @ApiOperation({ summary: 'AI travel compliance and visa warnings' })
  @ApiResponse({ status: 200, description: 'Compliance analysis' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('ai/compliance')
  analyzeCompliance(@Req() req: AuthenticatedRequest, @Body() dto: TravelComplianceCheckDto) {
    return this.service.analyzeCompliance(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Share a document via email, WhatsApp, or PDF link' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Share result' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  share(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: TravelDocumentShareDto) {
    return this.service.shareDocument(req.user.userId, id, dto);
  }

  @ApiOperation({ summary: 'Download a travel document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Binary document stream' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  async download(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Res() res: Response): Promise<void> {
    const payload = await this.service.getDocument(req.user.userId, id);
    res.setHeader('Content-Type', payload.document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${payload.document.originalFileName}"`);
    res.send(payload.content);
  }

  @ApiOperation({ summary: 'Public shared document download' })
  @ApiParam({ name: 'token', description: 'Share token' })
  @ApiResponse({ status: 200, description: 'Binary document stream' })
  @Get('share/:token')
  async publicDownload(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const payload = await this.service.getSharedDocument(token);
    res.setHeader('Content-Type', payload.document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${payload.document.originalFileName}"`);
    res.send(payload.content);
  }
}
