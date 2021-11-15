import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  amountAvailable: number;

  @Column({ default: 0 })
  cost: number;

  @Column({ nullable: false })
  productName: string;

  @Column({ nullable: false })
  sellerId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.ownedProducts)
  @JoinColumn({ name: 'sellerId' })
  seller: User;
}
