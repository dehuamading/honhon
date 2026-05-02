import { NextRequest, NextResponse } from 'next/server';
import { VoiceType, VOICE_CONFIGS } from '@/types/game';
import { cleanTextForSpeech } from '@/lib/utils';

// ============================================
// API配置
// ============================================
const COZE_API_URL = process.env.COZE_API_BASE || 'https://api.coze.cn';
const COZE_API_TOKEN = process.env.COZE_API_TOKEN || '';

// ============================================
// 获取speaker ID
// ============================================
function getSpeaker(voiceType: VoiceType): string {
  const config = VOICE_CONFIGS.find((v) => v.type === voiceType);
  return config?.speaker || 'zh_female_xiaohe_uranus_bigtts';
}

// ============================================
// POST /api/tts
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceType, uid } = body as {
      text: string;
      voiceType: VoiceType;
      uid: string;
    };

    if (!text) {
      return NextResponse.json({ audioUri: '', audioSize: 0 }, { status: 400 });
    }

    // 清理文本（去掉括号内容）
    const cleanText = cleanTextForSpeech(text);

    if (!cleanText) {
      return NextResponse.json({ audioUri: '', audioSize: 0 });
    }

    // 如果没有配置API Token，返回空
    if (!COZE_API_TOKEN) {
      console.log('[TTS API] No API token, skipping TTS');
      return NextResponse.json({ audioUri: '', audioSize: 0 });
    }

    const speaker = getSpeaker(voiceType);

    // 调用Coze TTS API
    // 注意：这里的API端点可能需要根据实际Coze API调整
    const response = await fetch(`${COZE_API_URL}/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${COZE_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'coze-tts',
        input: cleanText,
        voice_id: speaker,
        user_id: uid || 'anonymous',
      }),
      signal: AbortSignal.timeout(15000), // 15秒超时
    });

    if (!response.ok) {
      console.error('[TTS API] Coze TTS API error:', response.status);
      return NextResponse.json({ audioUri: '', audioSize: 0 });
    }

    // 假设返回的是音频数据
    // Coze TTS API 可能返回不同的格式，这里需要根据实际返回调整
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('audio')) {
      // 返回的是二进制音频数据
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 在实际项目中，这里应该将音频上传到存储服务
      // 然后返回URL。这里简化为返回空。
      console.log('[TTS API] Received audio data, size:', buffer.length);

      return NextResponse.json({
        audioUri: '', // 实际项目中应该返回音频URL
        audioSize: buffer.length,
      });
    }

    // 尝试解析JSON响应
    try {
      const data = await response.json();
      return NextResponse.json({
        audioUri: data.audio_url || '',
        audioSize: data.audio_size || 0,
      });
    } catch {
      return NextResponse.json({ audioUri: '', audioSize: 0 });
    }
  } catch (error) {
    console.error('[TTS API] Request error:', error);
    return NextResponse.json({ audioUri: '', audioSize: 0 });
  }
}
