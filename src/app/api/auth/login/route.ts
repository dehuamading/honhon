import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/users';
import { createSessionToken } from '@/lib/auth';

// ============================================
// Session 配置
// ============================================
const SESSION_COOKIE_NAME = 'honhon_session';  // Cookie 名称
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;      // 7 天有效期（秒）

/**
 * POST /api/auth/login
 * 用户登录接口
 *
 * 请求体:
 * {
 *   "username": "用户名",
 *   "password": "密码"
 * }
 *
 * 成功响应: { success: true, user: { id, username } }
 *          并设置 httpOnly Cookie
 * 失败响应: { success: false, error: "错误信息" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 调用登录验证逻辑
    const result = loginUser({ username, password });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // 生成会话 Token
    const token = createSessionToken(result.user!.id);

    // 创建响应
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
      },
    });

    // 设置 httpOnly Cookie（防止 XSS 攻击）
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,      // 禁止 JavaScript 访问
      secure: process.env.NODE_ENV === 'production',  // 生产环境使用 HTTPS
      sameSite: 'lax',     // 防止 CSRF
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
