import { UsageLog } from '../../../../domain/usage-log';
import { UsageLogEntity } from '../entities/usage-log.entity';

export class UsageLogMapper {
  static toDomain(raw: UsageLogEntity): UsageLog {
    const domainEntity = new UsageLog();
    domainEntity.id = raw.id;
    domainEntity.apiKeyId = raw.apiKeyId;
    domainEntity.endpoint = raw.endpoint;
    domainEntity.method = raw.method;
    domainEntity.ipAddress = raw.ipAddress;
    domainEntity.userAgent = raw.userAgent;
    domainEntity.statusCode = raw.statusCode;
    domainEntity.responseTime = raw.responseTime;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: UsageLog): UsageLogEntity {
    const persistenceEntity = new UsageLogEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.apiKeyId = domainEntity.apiKeyId ?? null;
    persistenceEntity.endpoint = domainEntity.endpoint;
    persistenceEntity.method = domainEntity.method;
    persistenceEntity.ipAddress = domainEntity.ipAddress ?? null;
    persistenceEntity.userAgent = domainEntity.userAgent ?? null;
    persistenceEntity.statusCode = domainEntity.statusCode;
    persistenceEntity.responseTime = domainEntity.responseTime ?? null;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
