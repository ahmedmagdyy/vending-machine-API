import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class UserRoleEnum {
  public static readonly BUYER = 'buyer';
  public static readonly SELLER = 'seller';
}

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ default: 0 })
  deposit: number;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    nullable: false,
  })
  role: UserRoleEnum;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.seller)
  ownedProducts: Product[];
}
