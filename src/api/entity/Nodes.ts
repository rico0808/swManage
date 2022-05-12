import { EntityModel } from "@midwayjs/orm";
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@EntityModel("Nodes")
export class Nodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ddns: string;

  @Column()
  relayID: number;

  @Column()
  landID: number;

  @Column()
  port: number;

  @Column({ default: 1 })
  status: number;

  @Column()
  recordId: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
