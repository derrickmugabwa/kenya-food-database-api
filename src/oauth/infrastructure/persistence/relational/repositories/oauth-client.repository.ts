import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthClientEntity } from '../entities/oauth-client.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { OAuthClient } from '../../../../domain/oauth-client';
import { OAuthClientMapper } from '../mappers/oauth-client.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class OAuthClientRelationalRepository {
  constructor(
    @InjectRepository(OAuthClientEntity)
    private readonly oauthClientRepository: Repository<OAuthClientEntity>,
  ) {}

  async create(data: OAuthClient): Promise<OAuthClient> {
    const persistenceModel = OAuthClientMapper.toPersistence(data);
    const newEntity = await this.oauthClientRepository.save(
      this.oauthClientRepository.create(persistenceModel),
    );
    return OAuthClientMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OAuthClient[]> {
    const entities = await this.oauthClientRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => OAuthClientMapper.toDomain(entity));
  }

  async findById(id: OAuthClient['id']): Promise<NullableType<OAuthClient>> {
    const entity = await this.oauthClientRepository.findOne({
      where: { id },
    });

    return entity ? OAuthClientMapper.toDomain(entity) : null;
  }

  async findByClientId(clientId: string): Promise<NullableType<OAuthClient>> {
    const entity = await this.oauthClientRepository.findOne({
      where: { clientId },
      relations: ['user'],
    });

    return entity ? OAuthClientMapper.toDomain(entity) : null;
  }

  async findByUserId(
    userId: number,
    {
      paginationOptions,
    }: {
      paginationOptions: IPaginationOptions;
    },
  ): Promise<OAuthClient[]> {
    const entities = await this.oauthClientRepository.find({
      where: { userId },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => OAuthClientMapper.toDomain(entity));
  }

  async update(
    id: OAuthClient['id'],
    payload: Partial<OAuthClient>,
  ): Promise<OAuthClient | null> {
    const entity = await this.oauthClientRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.oauthClientRepository.save(
      this.oauthClientRepository.create(
        OAuthClientMapper.toPersistence({
          ...OAuthClientMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return OAuthClientMapper.toDomain(updatedEntity);
  }

  async remove(id: OAuthClient['id']): Promise<void> {
    await this.oauthClientRepository.softDelete(id);
  }
}
