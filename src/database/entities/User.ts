require("dotenv").config()
import Hashids from "hashids"
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm"
import { config } from "../../config"
import { Team } from "./Team"

@Entity("users")
@Unique(["email"])
@Unique(["username"])
export class User extends BaseEntity {
  /**
   * * Unique IDs
   */
  @PrimaryColumn() id!: string
  @PrimaryGeneratedColumn() incrementId!: number

  /**
   * * Fields
   */
  @Column() firstName!: string
  @Column() lastName!: string
  @Column() email!: string
  @Column() password!: string
  @Column() username!: string

  /**
   * * Relationships
   */
  @ManyToMany(_ => Team, team => team.users)
  @JoinTable({ name: "users_teams" })
  teams!: Promise<Team[]>

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

    this.id = `${config.entityPrefixes.user}${parseInt(encoded)}`
    this.username = `${parseInt(encoded)}`
  }
}
