import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Servers")
export class Servers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: number;

  @Column()
  name: string;

  @Column()
  ip: string;

  @Column()
  port: number;

  @Column({ default: 0 })
  status: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
