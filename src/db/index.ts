/**
 * ============================================
 * Neon PostgreSQL 数据库连接
 * ============================================
 * 使用 @neondatabase/serverless 驱动
 * 适配 Edge Runtime 和 Serverless 环境
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 未配置，请检查 .env.local');
}

// Neon serverless SQL 客户端
const sql = neon(process.env.DATABASE_URL);

// Drizzle ORM 实例（携带 schema 以支持关系查询）
export const db = drizzle(sql, { schema });
