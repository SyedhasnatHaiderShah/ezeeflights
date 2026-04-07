import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpsertTravelerDto } from '../dto/saved-traveler.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileService } from '../services/profile.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('profile')
@Controller({ path: 'profile', version: '1' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.service.getMyProfile(req.user.userId);
  }

  @Put('update')
  update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.service.updateMyProfile(req.user.userId, dto);
  }

  @Post('travelers')
  addTraveler(@Req() req: AuthenticatedRequest, @Body() dto: UpsertTravelerDto) {
    return this.service.addTraveler(req.user.userId, dto);
  }

  @Put('travelers/:id')
  editTraveler(@Req() req: AuthenticatedRequest, @Param('id') travelerId: string, @Body() dto: UpsertTravelerDto) {
    return this.service.updateTraveler(req.user.userId, travelerId, dto);
  }

  @Get('travelers')
  travelers(@Req() req: AuthenticatedRequest) {
    return this.service.listTravelers(req.user.userId);
  }

  @Delete('travelers/:id')
  deleteTraveler(@Req() req: AuthenticatedRequest, @Param('id') travelerId: string) {
    return this.service.deleteTraveler(req.user.userId, travelerId);
  }
}
