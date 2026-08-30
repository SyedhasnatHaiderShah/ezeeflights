import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AssistantPromptDto {
  @ApiProperty({ example: 'Find me a cheap flight to Paris next weekend', description: 'Natural language prompt for the AI assistant', minLength: 2 })
  @IsString()
  @MinLength(2)
  prompt!: string;
}
