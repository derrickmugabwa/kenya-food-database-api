import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { FoodEntity } from '../../../../../foods/infrastructure/persistence/relational/entities/food.entity';

@Entity({
  name: 'nutrient',
})
export class NutrientEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => FoodEntity)
  @JoinColumn({ name: 'foodId' })
  food: FoodEntity;

  @Column({ type: Number, unique: true })
  foodId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  energyKcal: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  proteinG: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fatG: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carbohydratesG: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fiberG: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sugarG: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calciumMg: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ironMg: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  vitaminAMcg: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  vitaminCMg: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sodiumMg: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
