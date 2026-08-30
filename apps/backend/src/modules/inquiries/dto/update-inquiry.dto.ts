import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateInquiryDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'REVIEWED', 'CONTACTED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['PENDING', 'REVIEWED', 'CONTACTED', 'CLOSED'])
  status?: 'PENDING' | 'REVIEWED' | 'CONTACTED' | 'CLOSED';

  @ApiPropertyOptional({ example: 'Called the customer — ticket confirmed for Jun 2.' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
