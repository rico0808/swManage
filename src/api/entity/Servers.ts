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

  @Column({ unique: true })
  ddns: string;

  @Column()
  type: number;

  @Column()
  name: string;

  @Column()
  port: number;

  @Column()
  key: string;

  @Column({ default: 0 })
  status: number;

  @Column()
  recordId: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
