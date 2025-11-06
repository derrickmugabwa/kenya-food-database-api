import { Contact } from '../../../../domain/contact';
import { ContactEntity } from '../entities/contact.entity';

export class ContactMapper {
  static toDomain(raw: ContactEntity): Contact {
    const domainEntity = new Contact();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.email = raw.email;
    domainEntity.subject = raw.subject;
    domainEntity.message = raw.message;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Contact): ContactEntity {
    const persistenceEntity = new ContactEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.subject = domainEntity.subject;
    persistenceEntity.message = domainEntity.message;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
