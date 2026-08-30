import { PartialType } from '@nestjs/swagger';
import { CreateUsaMarkupDto } from './create-usa-markup.dto';

export class UpdateUsaMarkupDto extends PartialType(CreateUsaMarkupDto) {}
