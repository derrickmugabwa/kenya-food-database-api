import { OAuthToken } from '../../../../domain/oauth-token';
import { OAuthTokenEntity } from '../entities/oauth-token.entity';

export class OAuthTokenMapper {
  static toDomain(raw: OAuthTokenEntity): OAuthToken {
    const domainEntity = new OAuthToken();
    domainEntity.id = raw.id;
    domainEntity.accessToken = raw.accessToken;
    domainEntity.clientId = raw.clientId;
    domainEntity.scopes = raw.scopes;
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.revoked = raw.revoked;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: OAuthToken): OAuthTokenEntity {
    const persistenceEntity = new OAuthTokenEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.accessToken = domainEntity.accessToken;
    persistenceEntity.clientId = domainEntity.clientId;
    persistenceEntity.scopes = domainEntity.scopes;
    persistenceEntity.expiresAt = domainEntity.expiresAt;
    persistenceEntity.revoked = domainEntity.revoked;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
