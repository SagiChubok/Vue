import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeRoleToRoles1763487000000 implements MigrationInterface {
  name = 'ChangeRoleToRoles1763487000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
        SELECT id, username, json_array(role), status
        FROM users
      `);

      await queryRunner.query(`DROP TABLE users`);

      await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);

      console.log('Migration completed: role column changed to roles (JSON array)');
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
          role TEXT NOT NULL DEFAULT 'User',
          status INTEGER NULL
        )
      `);

      await queryRunner.query(`
        INSERT INTO users_temp (id, username, role, status)
        SELECT id, username, json_extract(roles, '$[0]'), status
        FROM users
      `);

      await queryRunner.query(`DROP TABLE users`);

      await queryRunner.query(`ALTER TABLE users_temp RENAME TO users`);

      console.log('Migration rolled back: roles column changed back to role (single value)');
    } catch (error) {
      console.error('Migration down error:', error);
      throw error;
    }
  }
}

