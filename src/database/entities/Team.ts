require("dotenv").config()
import Hashids from "hashids"
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { config } from "../../config"
import { User } from "./User"

@Entity("teams")
export class Team extends BaseEntity {
  /**
   * * Unique IDs
   */
  @PrimaryColumn() id!: string
  @PrimaryGeneratedColumn() incrementId!: number

  /**
   * * Fields
   */
  @Column() type!: string
  @Column() name!: string
  @Column({ nullable: true }) description!: string

  /**
   * * Relationships
   */
  @ManyToMany(_ => User, user => user.teams)
  users!: Promise<User[]>

  /**
   * * Timestamps
   */
  @CreateDateColumn() createdAt!: string
  @UpdateDateColumn() updatedAt!: number

  /**
   * * Lifecycle Events
   */
  @BeforeInsert()
  async beforeInsert() {
    const hashids = new Hashids(
      process.env.HASHIDS_SALT!,
      parseInt(process.env.HASHIDS_MINLENGTH!),
      process.env.HASHIDS_ALPHABET
    )
    const hex = Buffer.from(new Date().toString()).toString("hex")
    const encoded = await hashids.encodeHex(hex)

    this.id = `${config.entityPrefixes.team}${parseInt(encoded)}`
  }
}
