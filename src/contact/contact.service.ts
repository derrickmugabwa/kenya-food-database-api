import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactRepository } from './infrastructure/persistence/contact.repository';
import { Contact } from './domain/contact';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactRepository.create({
      name: createContactDto.name,
      email: createContactDto.email,
      subject: createContactDto.subject,
      message: createContactDto.message,
      status: 'pending',
    } as Contact);
  }

  async findAll({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Contact[]> {
    return this.contactRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  async findOne(id: number): Promise<Contact | null> {
    return this.contactRepository.findById(id);
  }

  async update(id: number, payload: Partial<Contact>): Promise<Contact | null> {
    return this.contactRepository.update(id, payload);
  }

  async remove(id: number): Promise<void> {
    return this.contactRepository.remove(id);
  }
}
