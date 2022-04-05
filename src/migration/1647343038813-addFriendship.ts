import {MigrationInterface, QueryRunner} from "typeorm";

export class addFriendship1647343038813 implements MigrationInterface {
    name = 'addFriendship1647343038813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "friendship" ("id" SERIAL NOT NULL, "status" integer NOT NULL DEFAULT '0', "followerId" integer, "followingId" integer, CONSTRAINT "PK_dbd6fb568cd912c5140307075cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_9edacbfc223cb2874d1f0aad1ee" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_4d257bce5148ea8eef118821d79" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_4d257bce5148ea8eef118821d79"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_9edacbfc223cb2874d1f0aad1ee"`);
        await queryRunner.query(`DROP TABLE "friendship"`);
    }

}
