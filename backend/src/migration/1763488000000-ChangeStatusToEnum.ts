import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeStatusToEnum1763488000000 implements MigrationInterface {
  name = 'ChangeStatusToEnum1763488000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`
        CREATE TABLE users_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          roles TEXT NOT NULL DEFAULT '["User"]',
          status TEXT NOT NULL DEFAULT 'Enabled'
        )
      `);

      await queryRunner.query(`
        INSERT INTO users_temp (id, username, roles, status)
        SELECT 
          id, 
          username, 
          roles,
          CASE 
            WHEN status = 1 THEN 'Enabled'
            WHEN status = 0 THEN 'Disabled'
            ELSE 'Enabled'
          END
        FROM users
      `);

      await queryRunner.query(`DROP TABLE users`);

      await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);

      console.log('Migration completed: status changed from boolean to enum (Enabled, Disabled, Deleted)');
    } catch (error) {
      console.error('Migration up error:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`
        CREATE TABLE users_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          roles TEXT NOT NULL DEFAULT '["User"]',
          status INTEGER NULL
        )
      `);

      await queryRunner.query(`
        INSERT INTO users_temp (id, username, roles, status)
        SELECT 
          id, 
          username, 
          roles,
          CASE 
            WHEN status = 'Enabled' THEN 1
            WHEN status = 'Disabled' THEN 0
            WHEN status = 'Deleted' THEN 0
            ELSE 1
          END
        FROM users
      `);

      await queryRunner.query(`DROP TABLE users`);

      await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);

      console.log('Migration rolled back: status changed from enum back to boolean');
    } catch (error) {
      console.error('Migration down error:', error);
      throw error;
    }
  }
}

