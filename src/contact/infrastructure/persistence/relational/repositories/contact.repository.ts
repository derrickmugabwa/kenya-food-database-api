import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactEntity } from '../entities/contact.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Contact } from '../../../../domain/contact';
import { ContactRepository } from '../../contact.repository';
import { ContactMapper } from '../mappers/contact.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ContactRelationalRepository implements ContactRepository {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
  ) {}

  async create(
    data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Contact> {
    const persistenceModel = ContactMapper.toPersistence({
      ...data,
      status: 'pending',
    } as Contact);
    const newEntity = await this.contactRepository.save(
      this.contactRepository.create(persistenceModel),
    );
    return ContactMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Contact[]> {
    const entities = await this.contactRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map((entity) => ContactMapper.toDomain(entity));
  }

  async findById(id: Contact['id']): Promise<NullableType<Contact>> {
    const entity = await this.contactRepository.findOne({
      where: { id },
    });

    return entity ? ContactMapper.toDomain(entity) : null;
  }

  async update(
    id: Contact['id'],
    payload: Partial<Contact>,
  ): Promise<Contact | null> {
    const entity = await this.contactRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.contactRepository.save(
      this.contactRepository.create(
        ContactMapper.toPersistence({
          ...ContactMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ContactMapper.toDomain(updatedEntity);
  }

  async remove(id: Contact['id']): Promise<void> {
    await this.contactRepository.delete(id);
  }
}
