import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpsertTravelerDto } from '../dto/saved-traveler.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileService } from '../services/profile.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Profile')
@Controller({ path: 'profile', version: '1' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'Profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.service.getMyProfile(req.user.userId);
  }

  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Put('update')
  update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.service.updateMyProfile(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Add a saved traveler to my profile' })
  @ApiResponse({ status: 201, description: 'Traveler added' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('travelers')
  addTraveler(@Req() req: AuthenticatedRequest, @Body() dto: UpsertTravelerDto) {
    return this.service.addTraveler(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Update a saved traveler' })
  @ApiParam({ name: 'id', description: 'Traveler UUID' })
  @ApiResponse({ status: 200, description: 'Traveler updated' })
  @ApiResponse({ status: 404, description: 'Traveler not found' })
  @Put('travelers/:id')
  editTraveler(@Req() req: AuthenticatedRequest, @Param('id') travelerId: string, @Body() dto: UpsertTravelerDto) {
    return this.service.updateTraveler(req.user.userId, travelerId, dto);
  }

  @ApiOperation({ summary: 'List all saved travelers' })
  @ApiResponse({ status: 200, description: 'Array of travelers' })
  @Get('travelers')
  travelers(@Req() req: AuthenticatedRequest) {
    return this.service.listTravelers(req.user.userId);
  }

  @ApiOperation({ summary: 'Delete a saved traveler' })
  @ApiParam({ name: 'id', description: 'Traveler UUID' })
  @ApiResponse({ status: 200, description: 'Traveler deleted' })
  @ApiResponse({ status: 404, description: 'Traveler not found' })
  @Delete('travelers/:id')
  deleteTraveler(@Req() req: AuthenticatedRequest, @Param('id') travelerId: string) {
    return this.service.deleteTraveler(req.user.userId, travelerId);
  }
}
