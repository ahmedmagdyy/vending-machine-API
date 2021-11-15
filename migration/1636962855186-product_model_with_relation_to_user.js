const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class productModelWithRelationToUser1636962855186 {
  name = 'productModelWithRelationToUser1636962855186';

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amountAvailable" integer NOT NULL DEFAULT '0', "cost" integer NOT NULL DEFAULT '0', "productName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sellerId" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
  }
};
