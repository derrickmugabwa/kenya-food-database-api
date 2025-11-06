import { PartialType } from '@nestjs/swagger';
import { CreateOAuthClientDto } from './create-oauth-client.dto';

export class UpdateOAuthClientDto extends PartialType(CreateOAuthClientDto) {}
