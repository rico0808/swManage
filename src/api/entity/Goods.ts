import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Goods")
export class Goods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sku: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0.0 })
  price: number;

  @Column({ default: 0 })
  traffic: number;

  @Column({ default: 30 })
  days: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
