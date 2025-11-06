import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'api_key',
})
export class ApiKeyEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Index()
  @Column({ type: Number })
  userId: number;

  @Column({ type: String, length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: String, length: 255, unique: true })
  keyHash: string;

  @Column({ type: String, length: 20 })
  keyPrefix: string;

  @Column({ type: String, nullable: true })
  description: string | null;

  @Index()
  @Column({ type: String, length: 20, default: 'active' })
  status: string;

  @Column({ type: String, length: 20, default: 'free' })
  tier: string;

  @Column({ type: Number, default: 1000 })
  rateLimit: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
