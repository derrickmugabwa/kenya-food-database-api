import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'contact',
})
export class ContactEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String, length: 100 })
  name: string;

  @Column({ type: String, length: 100 })
  email: string;

  @Column({ type: String, length: 200 })
  subject: string;

  @Column({ type: String, length: 2000 })
  message: string;

  @Column({ type: String, length: 20, default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
