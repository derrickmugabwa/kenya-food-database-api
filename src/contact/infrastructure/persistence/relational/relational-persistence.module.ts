import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './entities/contact.entity';
import { ContactRelationalRepository } from './repositories/contact.repository';
import { ContactRepository } from '../contact.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity])],
  providers: [
    {
      provide: ContactRepository,
      useClass: ContactRelationalRepository,
    },
  ],
  exports: [ContactRepository],
})
export class RelationalContactPersistenceModule {}
