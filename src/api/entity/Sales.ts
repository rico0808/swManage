import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Sales")
export class Sales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  clientId: number;

  @Column()
  source: string;

  @Column()
  orderNo: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0.0 })
  amount: number;

  @Column("text")
  detail: string;

  @Column("text")
  remark: string;

  @Column()
  status: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
