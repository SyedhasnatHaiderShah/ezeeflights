import { IsString, MinLength } from 'class-validator';

export class AssistantPromptDto {
  @IsString()
  @MinLength(2)
  prompt!: string;
}
