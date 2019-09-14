import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTeamsTable1567373791850 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" character varying NOT NULL, "incrementId" SERIAL NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c6f015d837c4ea83eba811206d5" PRIMARY KEY ("id", "incrementId"))`
    )
    await queryRunner.query(
      `CREATE TABLE "users_teams" ("usersId" character varying NOT NULL, "usersIncrementId" integer NOT NULL, "teamsId" character varying NOT NULL, "teamsIncrementId" integer NOT NULL, CONSTRAINT "PK_db05ebaf2ec4f72f78e4198858e" PRIMARY KEY ("usersId", "usersIncrementId", "teamsId", "teamsIncrementId"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_69e305c9f5d40c1da8bc633179" ON "users_teams" ("usersId", "usersIncrementId") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_8caf922fa14aad156082cd7f59" ON "users_teams" ("teamsId", "teamsIncrementId") `
    )
    await queryRunner.query(
      `ALTER TABLE "users_teams" ADD CONSTRAINT "FK_69e305c9f5d40c1da8bc633179a" FOREIGN KEY ("usersId", "usersIncrementId") REFERENCES "users"("id","incrementId") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "users_teams" ADD CONSTRAINT "FK_8caf922fa14aad156082cd7f59e" FOREIGN KEY ("teamsId", "teamsIncrementId") REFERENCES "teams"("id","incrementId") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "users_teams" DROP CONSTRAINT "FK_8caf922fa14aad156082cd7f59e"`
    )
    await queryRunner.query(
      `ALTER TABLE "users_teams" DROP CONSTRAINT "FK_69e305c9f5d40c1da8bc633179a"`
    )
    await queryRunner.query(`DROP INDEX "IDX_8caf922fa14aad156082cd7f59"`)
    await queryRunner.query(`DROP INDEX "IDX_69e305c9f5d40c1da8bc633179"`)
    await queryRunner.query(`DROP TABLE "users_teams"`)
    await queryRunner.query(`DROP TABLE "teams"`)
  }
}
