import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Clients")
export class Clients {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  source: string;

  @Column()
  tb: string;

  @Column()
  account: string;

  @Column()
  passwd: string;

  @Column({ default: 0 })
  used: number;

  @Column({ default: 0 })
  traffic: number;

  @Column({ default: 1 })
  status: number;

  @Column("datetime")
  expireAt: Date;

  @Column({ default: null })
  apiKey: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
