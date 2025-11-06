import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeyRepository } from './infrastructure/persistence/api-key.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { ApiKey } from './domain/api-key';

@Injectable()
export class ApiKeysService {
  constructor(
    // Dependencies here
    private readonly apiKeyRepository: ApiKeyRepository,
  ) {}

  async create(createApiKeyDto: CreateApiKeyDto) {
    // Do not remove comment below.
    // <creating-property />

    const bcrypt = await import('bcrypt');

    // Generate a unique API key
    const key = this.generateApiKey();
    const keyHash = await bcrypt.hash(key, 10);
    const keyPrefix = key.substring(0, 15) + '...';

    const apiKey = await this.apiKeyRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      userId: createApiKeyDto.userId,
      name: createApiKeyDto.name,
      keyHash,
      keyPrefix,
      description: createApiKeyDto.description,
      status: 'active',
      tier: createApiKeyDto.tier ?? 'free',
      rateLimit: createApiKeyDto.rateLimit ?? 1000,
      expiresAt: createApiKeyDto.expiresAt
        ? new Date(createApiKeyDto.expiresAt)
        : null,
      lastUsedAt: null,
    } as ApiKey);

    // Return the plain key only once (won't be stored)
    return {
      ...apiKey,
      key, // Plain key for user to save
    };
  }

  private generateApiKey(): string {
    const prefix = 'kfdb_live_';
    const randomBytes =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return prefix + randomBytes;
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.apiKeyRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: ApiKey['id']) {
    return this.apiKeyRepository.findById(id);
  }

  findByIds(ids: ApiKey['id'][]) {
    return this.apiKeyRepository.findByIds(ids);
  }

  findByUserId(userId: ApiKey['userId']) {
    return this.apiKeyRepository.findByUserId(userId);
  }

  async update(id: ApiKey['id'], updateApiKeyDto: UpdateApiKeyDto) {
    // Do not remove comment below.
    // <updating-property />

    return this.apiKeyRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      ...updateApiKeyDto,
      ...(updateApiKeyDto.expiresAt && {
        expiresAt: new Date(updateApiKeyDto.expiresAt),
      }),
    });
  }

  remove(id: ApiKey['id']) {
    return this.apiKeyRepository.remove(id);
  }
}
