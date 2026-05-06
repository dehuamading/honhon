/**
 * ============================================
 * 数据库 Schema 定义（Drizzle ORM）
 * ============================================
 * 使用 Drizzle ORM 定义 PostgreSQL 表结构
 */

import { pgTable, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * 用户表
 * 对应原 .data/users.json 的数据结构
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
