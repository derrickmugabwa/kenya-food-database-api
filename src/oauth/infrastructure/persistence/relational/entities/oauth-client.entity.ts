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
  name: 'oauth_client',
})
@Index(['userId'])
@Index(['status'])
export class OAuthClientEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String, unique: true, length: 100 })
  clientId: string;

  @Column({ type: String, length: 255 })
  clientSecretHash: string;

  @Column({ type: String, length: 100 })
  name: string;

  @Column({ type: String, nullable: true })
  description: string | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: Number })
  userId: number;

  @Column({ type: 'simple-array' })
  scopes: string[];

  @Column({ type: 'simple-array', default: 'client_credentials' })
  grantTypes: string[];

  @Column({ type: String, length: 20, default: 'free' })
  tier: string;

  @Column({ type: Number, default: 1000 })
  rateLimit: number;

  @Column({ type: String, length: 20, default: 'active' })
  status: string;

  @Column({ type: Date, nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
