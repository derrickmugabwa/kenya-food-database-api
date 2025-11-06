import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OAuthService } from './oauth.service';
import { TokenRequestDto } from './dto/token-request.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { CreateOAuthClientDto } from './dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from './dto/update-oauth-client.dto';
import { OAuthClient } from './domain/oauth-client';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('OAuth')
@Controller({
  path: 'oauth',
  version: '1',
})
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('token')
  @ApiOperation({
    summary: 'Get access token using client credentials',
    description: 'OAuth 2.0 token endpoint for client credentials grant',
  })
  @ApiOkResponse({ type: TokenResponseDto })
  async token(@Body() dto: TokenRequestDto): Promise<TokenResponseDto> {
    return this.oauthService.issueToken(dto);
  }

  @Post('clients')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create OAuth client (Self-service)' })
  @ApiCreatedResponse({ type: OAuthClient })
  async createClient(
    @Body() createDto: CreateOAuthClientDto,
    @Request() request,
  ) {
    // Force userId to be the authenticated user (security)
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Override userId from DTO with authenticated user's ID
    createDto.userId = userId;

    const result = await this.oauthService.createClient(createDto);
    // Remove clientSecretHash from response for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clientSecretHash, ...clientWithoutHash } = result.client as any;
    return {
      client: clientWithoutHash,
      clientSecret: result.clientSecret,
    };
  }

  @Get('clients/all')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'List all OAuth clients (Admin only)' })
  @ApiOkResponse({ type: [OAuthClient] })
  async findAllClientsAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<OAuthClient[]> {
    // Admins can see all clients across all users
    return this.oauthService.findAllClients({
      paginationOptions: { page, limit },
    });
  }

  @Get('clients')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List your OAuth clients' })
  @ApiOkResponse({ type: [OAuthClient] })
  async findAllClients(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() request,
  ): Promise<OAuthClient[]> {
    const userId = request.user?.id;
    // Users can only see their own clients
    return this.oauthService.findClientsByUserId(userId, {
      paginationOptions: { page, limit },
    });
  }

  @Get('clients/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Get your OAuth client by ID' })
  @ApiOkResponse({ type: OAuthClient })
  async findClientById(
    @Param('id') id: number,
    @Request() request,
  ): Promise<OAuthClient | null> {
    const client = await this.oauthService.findClientById(+id);

    // Users can only view their own clients
    if (client && client.userId !== request.user?.id) {
      throw new UnauthorizedException('You can only view your own clients');
    }

    return client;
  }

  @Patch('clients/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Update your OAuth client' })
  @ApiOkResponse({ type: OAuthClient })
  async updateClient(
    @Param('id') id: number,
    @Body() updateDto: UpdateOAuthClientDto,
    @Request() request,
  ): Promise<OAuthClient | null> {
    const client = await this.oauthService.findClientById(+id);

    // Users can only update their own clients
    if (client && client.userId !== request.user?.id) {
      throw new UnauthorizedException('You can only update your own clients');
    }

    return this.oauthService.updateClient(+id, updateDto);
  }

  @Delete('clients/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Delete your OAuth client' })
  async removeClient(
    @Param('id') id: number,
    @Request() request,
  ): Promise<void> {
    const client = await this.oauthService.findClientById(+id);

    // Users can only delete their own clients
    if (client && client.userId !== request.user?.id) {
      throw new UnauthorizedException('You can only delete your own clients');
    }

    return this.oauthService.removeClient(+id);
  }
}
