import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CategoryEntity } from '../../../../../categories/infrastructure/persistence/relational/entities/category.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { NutrientEntity } from '../../../../../nutrients/infrastructure/persistence/relational/entities/nutrient.entity';

@Entity({
  name: 'food',
})
export class FoodEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String, unique: true, length: 50 })
  code: string;

  @Column({ type: String, length: 255 })
  name: string;

  @ManyToOne(() => CategoryEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column({ type: Number })
  categoryId: number;

  @Column({ type: String, nullable: true })
  description: string | null;

  @ManyToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'imageId' })
  image?: FileEntity | null;

  @Column({ type: String, nullable: true })
  imageId: string | null;

  @Column({ type: String, nullable: true, length: 50 })
  servingSize: string | null;

  @Column({ type: String, nullable: true, length: 20 })
  servingUnit: string | null;

  @OneToOne(() => NutrientEntity, (nutrient) => nutrient.food, {
    eager: true,
  })
  nutrients?: NutrientEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
