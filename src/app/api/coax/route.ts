import { NextRequest, NextResponse } from 'next/server';
import { generateCoaxReply, ReplyStyle } from '@/lib/cozbApi';

/**
 * ============================================
 * 哄人回复生成 API
 * ============================================
 * 前端调用此接口生成哄人回复
 *
 * POST /api/coax
 *
 * 请求体:
 * {
 *   "angryScene": "女朋友因为我打游戏忽略她生气了",  // 必填
 *   "replyStyle": "温柔宠溺"  // 可选，默认"温柔宠溺"
 * }
 *
 * 成功响应: { success: true, reply: "生成的哄人回复" }
 * 失败响应: { success: false, error: "错误信息" }
 */

// 回复风格集合（用于校验）
const VALID_STYLES = ['温柔宠溺', '撒娇', '霸道', '暖心', '幽默', '共情'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { angryScene, replyStyle } = body as {
      angryScene?: string;
      replyStyle?: string;
    };

    // 校验必填参数
    if (!angryScene || typeof angryScene !== 'string') {
      return NextResponse.json(
        { success: false, error: '请描述生气的场景' },
        { status: 400 }
      );
    }

    // 校验回复风格
    let style: ReplyStyle = '温柔宠溺';
    if (replyStyle && VALID_STYLES.includes(replyStyle)) {
      style = replyStyle as ReplyStyle;
    }

    // 生成哄人回复
    const reply = await generateCoaxReply(angryScene, style);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('[API/coax] Error:', error);
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
