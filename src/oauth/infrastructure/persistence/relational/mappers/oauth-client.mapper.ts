import { OAuthClient } from '../../../../domain/oauth-client';
import { OAuthClientEntity } from '../entities/oauth-client.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

export class OAuthClientMapper {
  static toDomain(raw: OAuthClientEntity): OAuthClient {
    const domainEntity = new OAuthClient();
    domainEntity.id = raw.id;
    domainEntity.clientId = raw.clientId;
    domainEntity.clientSecretHash = raw.clientSecretHash;
    domainEntity.name = raw.name;
    domainEntity.description = raw.description;
    domainEntity.userId = raw.userId;
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }
    domainEntity.scopes = raw.scopes;
    domainEntity.grantTypes = raw.grantTypes;
    domainEntity.tier = raw.tier;
    domainEntity.rateLimit = raw.rateLimit;
    domainEntity.status = raw.status;
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: OAuthClient): OAuthClientEntity {
    const persistenceEntity = new OAuthClientEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.clientId = domainEntity.clientId;
    persistenceEntity.clientSecretHash = domainEntity.clientSecretHash!;
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.description = domainEntity.description ?? null;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.scopes = domainEntity.scopes;
    persistenceEntity.grantTypes = domainEntity.grantTypes;
    persistenceEntity.tier = domainEntity.tier;
    persistenceEntity.rateLimit = domainEntity.rateLimit;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.expiresAt = domainEntity.expiresAt ?? null;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt ?? null;

    return persistenceEntity;
  }
}
