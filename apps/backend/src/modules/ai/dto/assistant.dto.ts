import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class AssistantPromptDto {
  @IsString()
  @MinLength(2)
  prompt!: string;
}

export class AiSearchDto {
  @IsString()
  @MinLength(2)
  query!: string;
}

export class AiChatDto {
  @IsString()
  @MinLength(2)
  sessionId!: string;

  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
