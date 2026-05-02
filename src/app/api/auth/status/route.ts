import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/users';
import { parseToken } from '@/lib/auth';

// ============================================
// Session 配置（需与 login 保持一致）
// ============================================
const SESSION_COOKIE_NAME = 'honhon_session';

/**
 * GET /api/auth/status
 * 检查用户登录状态接口
 *
 * 成功响应: { loggedIn: true, user: { id, username } }
 * 未登录响应: { loggedIn: false }
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 中获取 Token
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    // 解析 Token 获取用户ID
    const userId = parseToken(token);

    if (!userId) {
      return NextResponse.json({ loggedIn: false });
    }

    // 查找用户
    const user = findUserById(userId);

    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    // 返回用户信息
    return NextResponse.json({
      loggedIn: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('[Auth Status] Error:', error);
    return NextResponse.json({ loggedIn: false });
  }
}
