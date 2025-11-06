import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './domain/contact';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Contact')
@Controller({
  path: 'contact',
  version: '1',
})
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a contact message',
    description: 'Public endpoint for users to send contact messages',
  })
  @ApiCreatedResponse({ type: Contact })
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({
    summary: 'Get all contact messages (Admin only)',
  })
  @ApiOkResponse({ type: [Contact] })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Contact[]> {
    return this.contactService.findAll({
      paginationOptions: { page, limit },
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Get a contact message by ID (Admin only)',
  })
  @ApiOkResponse({ type: Contact })
  async findOne(@Param('id') id: number): Promise<Contact | null> {
    return this.contactService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Update contact message status (Admin only)',
  })
  @ApiOkResponse({ type: Contact })
  async update(
    @Param('id') id: number,
    @Body() updateDto: Partial<Contact>,
  ): Promise<Contact | null> {
    return this.contactService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Delete a contact message (Admin only)',
  })
  async remove(@Param('id') id: number): Promise<void> {
    return this.contactService.remove(+id);
  }
}
