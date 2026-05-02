import { NextRequest, NextResponse } from 'next/server';
import { ask, testConnection, DoubaoError, DoubaoErrorType } from '@/lib/doubao';

// ============================================
// 配置检查
// ============================================
function checkConfig(): { configured: boolean; message?: string } {
  const apiKey = process.env.DOUBAO_API_KEY;

  if (!apiKey) {
    return { configured: false, message: 'DOUBAO_API_KEY 未配置' };
  }

  if (apiKey.includes('你的APIKey') || apiKey.length < 10) {
    return { configured: false, message: 'DOUBAO_API_KEY 是占位符，请替换为真实密钥' };
  }

  const modelId = process.env.DOUBAO_MODEL_ID;
  if (!modelId) {
    return { configured: false, message: 'DOUBAO_MODEL_ID 未配置' };
  }

  return { configured: true };
}

// ============================================
// POST /api/seedream - 问答接口
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 检查配置
    const configCheck = checkConfig();
    if (!configCheck.configured) {
      return NextResponse.json(
        { success: false, error: '配置错误', message: configCheck.message },
        { status: 500 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { question, systemPrompt } = body as { question?: string; systemPrompt?: string };

    // 参数校验
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, error: '参数错误', message: '请提供有效的 question 参数' },
        { status: 400 }
      );
    }

    if (question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '参数错误', message: '问题内容不能为空' },
        { status: 400 }
      );
    }

    console.log('[API/doubao] 收到问题:', question.substring(0, 50));

    // 调用模型
    const answer = await ask(question, systemPrompt);

    console.log('[API/doubao] 生成回答成功');

    return NextResponse.json({ success: true, answer });

  } catch (error) {
    console.error('[API/doubao] 错误:', error);

    if (error instanceof DoubaoError) {
      const statusCode = error.statusCode || 500;
      return NextResponse.json(
        { success: false, error: error.type, message: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'UNKNOWN_ERROR', message: '发生未知错误，请稍后重试' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/seedream - 测试连接
// ============================================
export async function GET() {
  try {
    console.log('[API/doubao] 测试连接...');

    const configCheck = checkConfig();
    if (!configCheck.configured) {
      return NextResponse.json(
        { success: false, configured: false, message: configCheck.message },
        { status: 500 }
      );
    }

    const result = await testConnection();

    return NextResponse.json({
      success: result.success,
      configured: true,
      message: result.message,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[API/doubao] 测试失败:', errorMessage);

    return NextResponse.json(
      { success: false, configured: true, message: errorMessage },
      { status: 500 }
    );
  }
}
