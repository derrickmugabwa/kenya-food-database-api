import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { RelationalContactPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalContactPersistenceModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService, RelationalContactPersistenceModule],
})
export class ContactModule {}
