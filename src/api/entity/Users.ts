import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Users")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column()
  passwd: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0.0 })
  blance: number;

  @Column()
  invite: string;

  @Column({ default: "user" })
  role: string;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
