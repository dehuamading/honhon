import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/users';

/**
 * POST /api/auth/register
 * 用户注册接口
 *
 * 请求体:
 * {
 *   "username": "用户名",
 *   "password": "密码"
 * }
 *
 * 成功响应: { success: true, user: { id, username, createdAt } }
 * 失败响应: { success: false, error: "错误信息" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 调用注册逻辑
    const result = registerUser({ username, password });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // 注册成功，返回用户信息（不包含密码）
    const { user } = result;
    return NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        username: user!.username,
        createdAt: user!.createdAt,
      },
    });
  } catch (error) {
    console.error('[Auth Register] Error:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
