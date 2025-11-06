import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'usage_log',
})
@Index(['apiKeyId', 'createdAt'])
export class UsageLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: Number,
    nullable: true,
    comment: 'Stores either API Key ID or OAuth Client ID',
  })
  apiKeyId: number | null;

  @Column({ type: String, length: 500 })
  endpoint: string;

  @Column({ type: String, length: 10 })
  method: string;

  @Column({ type: String, length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: String, length: 500, nullable: true })
  userAgent: string | null;

  @Column({ type: Number })
  statusCode: number;

  @Column({ type: Number, nullable: true })
  responseTime: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
