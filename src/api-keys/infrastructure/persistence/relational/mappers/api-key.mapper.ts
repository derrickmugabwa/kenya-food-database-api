import { ApiKey } from '../../../../domain/api-key';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

export class ApiKeyMapper {
  static toDomain(raw: ApiKeyEntity): ApiKey {
    const domainEntity = new ApiKey();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }
    domainEntity.name = raw.name;
    domainEntity.keyHash = raw.keyHash;
    domainEntity.keyPrefix = raw.keyPrefix;
    domainEntity.description = raw.description;
    domainEntity.status = raw.status;
    domainEntity.tier = raw.tier;
    domainEntity.rateLimit = raw.rateLimit;
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.lastUsedAt = raw.lastUsedAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ApiKey): ApiKeyEntity {
    const persistenceEntity = new ApiKeyEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.keyHash = domainEntity.keyHash;
    persistenceEntity.keyPrefix = domainEntity.keyPrefix;
    persistenceEntity.description = domainEntity.description ?? null;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.tier = domainEntity.tier;
    persistenceEntity.rateLimit = domainEntity.rateLimit;
    persistenceEntity.expiresAt = domainEntity.expiresAt ?? null;
    persistenceEntity.lastUsedAt = domainEntity.lastUsedAt ?? null;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt ?? null;

    return persistenceEntity;
  }
}
