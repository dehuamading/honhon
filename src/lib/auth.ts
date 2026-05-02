/**
 * 认证工具模块
 * 提供密码哈希、Token生成与验证功能
 */

import crypto from 'crypto';

// ============================================
// 配置常量
// ============================================
const HASH_ALGORITHM = 'sha256';           // 哈希算法
const ITERATIONS = 10000;                   // PBKDF2 迭代次数
const KEY_LENGTH = 64;                       // 密钥长度
const TOKEN_LENGTH = 32;                    // Token 字节长度

// ============================================
// 密码哈希处理
// ============================================

/**
 * 使用 PBKDF2 对密码进行哈希加盐
 * @param password 明文密码
 * @returns 格式: salt:hash (冒号分隔)
 */
export function hashPassword(password: string): string {
  // 生成随机盐
  const salt = crypto.randomBytes(16).toString('hex');

  // 使用 PBKDF2 进行哈希
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGORITHM)
    .toString('hex');

  return `${salt}:${hash}`;
}

/**
 * 验证密码是否匹配
 * @param password 用户输入的明文密码
 * @param storedHash 存储的哈希值 (格式: salt:hash)
 * @returns 是否匹配
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;

    // 使用相同的盐重新计算哈希
    const computedHash = crypto
      .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGORITHM)
      .toString('hex');

    // 使用 timingSafeEqual 比较，防止时序攻击
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  } catch {
    return false;
  }
}

// ============================================
// Token 管理
// ============================================

/**
 * 生成随机 Token
 * @returns 十六进制格式的随机 Token
 */
export function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * 创建用户会话 Token
 * @param userId 用户ID
 * @returns Token 字符串
 */
export function createSessionToken(userId: string): string {
  // Token = userId 编码 + 随机部分
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `${userId}:${timestamp}:${random}`;
}

/**
 * 从 Token 中解析用户ID
 * @param token 会话Token
 * @returns 用户ID 或 null
 */
export function parseToken(token: string): string | null {
  const parts = token.split(':');
  if (parts.length < 3) return null;
  return parts[0];
}
