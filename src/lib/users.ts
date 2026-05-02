/**
 * 用户数据管理模块
 * 负责用户数据的增删改查操作，基于本地 JSON 文件存储
 */

import fs from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from './auth';

// ============================================
// 类型定义
// ============================================

/**
 * 用户数据结构
 */
export interface User {
  id: string;           // 用户唯一ID
  username: string;     // 用户名（唯一）
  password: string;     // 哈希后的密码
  createdAt: string;    // 注册时间
}

/**
 * 用户注册参数
 */
export interface RegisterParams {
  username: string;
  password: string;
}

/**
 * 用户登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

// ============================================
// 文件路径配置
// ============================================

// 用户数据文件存放目录
const DATA_DIR = path.join(process.cwd(), '.data');

// 用户数据文件路径
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// ============================================
// 文件操作辅助函数
// ============================================

/**
 * 确保数据目录存在
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 读取用户数据文件
 * @returns 用户数组
 */
function readUsers(): User[] {
  ensureDataDir();

  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 写入用户数据到文件
 * @param users 用户数组
 */
function writeUsers(users: User[]): void {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// ============================================
// 用户操作函数
// ============================================

/**
 * 生成唯一用户ID
 * @returns UUID格式的ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 根据用户名查找用户
 * @param username 用户名
 * @returns 用户对象或 null
 */
export function findUserByUsername(username: string): User | null {
  const users = readUsers();
  return users.find((u) => u.username === username) || null;
}

/**
 * 根据用户ID查找用户
 * @param userId 用户ID
 * @returns 用户对象或 null
 */
export function findUserById(userId: string): User | null {
  const users = readUsers();
  return users.find((u) => u.id === userId) || null;
}

/**
 * 注册新用户
 * @param params 注册参数
 * @returns 结果对象 { success, error?, user? }
 */
export function registerUser(params: RegisterParams): {
  success: boolean;
  error?: string;
  user?: User;
} {
  const { username, password } = params;

  // ---- 校验 ----

  // 用户名非空
  if (!username || username.trim() === '') {
    return { success: false, error: '用户名不能为空' };
  }

  // 密码非空
  if (!password || password.trim() === '') {
    return { success: false, error: '密码不能为空' };
  }

  // 用户名长度限制 3-20
  if (username.trim().length < 3 || username.trim().length > 20) {
    return { success: false, error: '用户名长度需在 3-20 个字符之间' };
  }

  // 密码长度限制 6-50
  if (password.length < 6 || password.length > 50) {
    return { success: false, error: '密码长度需在 6-50 个字符之间' };
  }

  // 用户名格式：只能包含字母、数字、下划线
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username.trim())) {
    return { success: false, error: '用户名只能包含字母、数字、下划线和中文' };
  }

  // 检查用户名是否已存在
  if (findUserByUsername(username.trim())) {
    return { success: false, error: '用户名已被注册' };
  }

  // ---- 创建用户 ----

  const users = readUsers();

  const newUser: User = {
    id: generateUserId(),
    username: username.trim(),
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  return { success: true, user: newUser };
}

/**
 * 验证用户登录
 * @param params 登录参数
 * @returns 结果对象 { success, error?, user? }
 */
export function loginUser(params: LoginParams): {
  success: boolean;
  error?: string;
  user?: User;
} {
  const { username, password } = params;

  // 查找用户
  const user = findUserByUsername(username.trim());

  if (!user) {
    return { success: false, error: '用户名或密码错误' };
  }

  // 验证密码
  if (!verifyPassword(password, user.password)) {
    return { success: false, error: '用户名或密码错误' };
  }

  return { success: true, user };
}

/**
 * 删除用户（用于测试或管理）
 * @param userId 用户ID
 */
export function deleteUser(userId: string): boolean {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return false;

  users.splice(index, 1);
  writeUsers(users);
  return true;
}
