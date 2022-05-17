import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Applys")
export class Applys {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  url: string;

  @Column()
  business: string;

  @Column({ default: "" })
  reason: string;

  @Column()
  status: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
