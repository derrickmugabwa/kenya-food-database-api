import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'oauth_token',
})
@Index(['clientId', 'expiresAt'])
@Index(['accessToken'])
export class OAuthTokenEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String, unique: true, length: 1000 })
  accessToken: string;

  @Column({ type: String })
  clientId: string;

  @Column({ type: 'simple-array' })
  scopes: string[];

  @Column({ type: Date })
  expiresAt: Date;

  @Column({ type: Boolean, default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
