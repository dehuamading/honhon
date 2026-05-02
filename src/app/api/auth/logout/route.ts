import { NextResponse } from 'next/server';

// ============================================
// Session 配置（需与 login 保持一致）
// ============================================
const SESSION_COOKIE_NAME = 'honhon_session';

/**
 * POST /api/auth/logout
 * 用户退出登录接口
 *
 * 清除 session Cookie 即可完成退出
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // 清除 Cookie
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,  // 立即过期
    path: '/',
  });

  return response;
}
