/**
 * ============================================
 * Doubao-Seedream-5.0-lite API 客户端
 * ============================================
 * 火山引擎豆包文生图模型
 * 接入点ID: ep-20260426175445-72vqt
 *
 * ⚠️ 注意：Seedream 是文生图模型，不支持文本对话！
 * 如需文本对话，请使用 doubao-seed 系列模型接入点
 *
 * 使用方式：
 * 1. 确保 .env.local 中配置了 SEEDREAM_API_KEY 和 SEEDREAM_ENDPOINT_ID
 * 2. 调用 generateImage(prompt) 生成图片
 * 3. 调用 describeImage(description) 根据描述生成图片说明
 */

// ============================================
// 配置常量
// ============================================

// API 基础地址
const SEEDREAM_API_URL = process.env.SEEDREAM_API_URL || 'https://ark.cn-beijing.volces.com/api/v3';

// 接入点 ID
const SEEDREAM_ENDPOINT_ID = process.env.SEEDREAM_ENDPOINT_ID || 'ep-20260426175445-72vqt';

// 请求超时时间（毫秒）- 生成图片可能需要更长时间
const REQUEST_TIMEOUT = 120000;

// ============================================
// 类型定义
// ============================================

/**
 * 图片生成响应
 */
export interface ImageGenerationResponse {
  image_url?: string;
  prompt?: string;
  model?: string;
  id?: string;
}

/**
 * 错误类型
 */
export enum SeedreamErrorType {
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  API_RESPONSE_EMPTY = 'API_RESPONSE_EMPTY',
  API_RESPONSE_FORMAT_ERROR = 'API_RESPONSE_FORMAT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  MODEL_NOT_SUPPORTED = 'MODEL_NOT_SUPPORTED',
}

/**
 * 自定义错误
 */
export class SeedreamError extends Error {
  constructor(
    message: string,
    public type: SeedreamErrorType,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SeedreamError';
  }
}

// ============================================
// 核心 API 调用函数
// ============================================

/**
 * 验证 API 配置
 */
function validateConfig(): void {
  const apiKey = process.env.SEEDREAM_API_KEY;
  if (!apiKey || apiKey.includes('你的APIKey') || apiKey.length < 10) {
    throw new SeedreamError(
      'SEEDREAM_API_KEY 未配置或为占位符，请检查 .env.local',
      SeedreamErrorType.API_KEY_NOT_CONFIGURED
    );
  }
}

/**
 * 调用 Seedream 模型（文生图）
 *
 * @param prompt - 图片描述提示词
 * @param negativePrompt - 负面提示词（不希望出现的内容）
 * @param imageSize - 图片尺寸，如 "1024x1024"
 * @param seed - 随机种子（可选）
 * @returns 图片URL或base64
 */
async function callSeedreamAPI(
  prompt: string,
  negativePrompt: string = '',
  imageSize: string = '1024x1024',
  seed?: number
): Promise<ImageGenerationResponse> {
  // 验证配置
  validateConfig();

  const apiKey = process.env.SEEDREAM_API_KEY!;

  console.log('[Seedream] 开始调用文生图 API');
  console.log('[Seedream] Endpoint:', SEEDREAM_ENDPOINT_ID);
  console.log('[Seedream] Prompt:', prompt.substring(0, 100));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(SEEDREAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: SEEDREAM_ENDPOINT_ID,
        prompt: prompt,
        negative_prompt: negativePrompt,
        image_size: imageSize,
        ...(seed !== undefined && { seed: seed }),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `API 请求失败，状态码: ${response.status}`;

      if (response.status === 401) {
        errorMsg = 'API 密钥无效或已过期';
      } else if (response.status === 403) {
        errorMsg = 'API 访问被拒绝，请检查权限';
      } else if (response.status === 429) {
        errorMsg = '请求过于频繁，请稍后再试';
      }

      console.error('[Seedream] API 错误:', errorText.substring(0, 300));
      throw new SeedreamError(errorMsg, SeedreamErrorType.API_REQUEST_FAILED, response.status);
    }

    // 解析响应
    const data = await response.json();
    console.log('[Seedream] 响应成功');

    // 提取图片URL或base64
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;

    if (!imageUrl) {
      console.log('[Seedream] 响应数据:', JSON.stringify(data).substring(0, 300));
      throw new SeedreamError(
        '未获取到图片数据',
        SeedreamErrorType.API_RESPONSE_EMPTY
      );
    }

    return {
      image_url: imageUrl,
      prompt: prompt,
      model: data.model,
      id: data.id,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof SeedreamError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new SeedreamError(
          `请求超时（${REQUEST_TIMEOUT / 1000}秒）`,
          SeedreamErrorType.TIMEOUT
        );
      }
      throw new SeedreamError(
        `网络错误: ${error.message}`,
        SeedreamErrorType.NETWORK_ERROR
      );
    }

    throw new SeedreamError(
      '未知错误',
      SeedreamErrorType.API_REQUEST_FAILED
    );
  }
}

// ============================================
// 公开接口
// ============================================

/**
 * 生成图片
 *
 * @param prompt - 图片描述（英文效果更好）
 * @param negativePrompt - 不希望出现的内容（可选）
 * @param imageSize - 图片尺寸，默认 1024x1024
 * @returns 生成的图片URL或base64
 *
 * @example
 * ```ts
 * const result = await generateImage("A cute cat sitting on a couch");
 * console.log(result.image_url); // "https://..."
 * ```
 */
export async function generateImage(
  prompt: string,
  negativePrompt: string = '',
  imageSize: string = '1024x1024'
): Promise<ImageGenerationResponse> {
  return await callSeedreamAPI(prompt, negativePrompt, imageSize);
}

/**
 * 描述图片（根据描述生成图片的说明）
 *
 * @param description - 图片描述
 * @returns 图片说明
 */
export async function describeImage(
  description: string
): Promise<string> {
  const prompt = `请详细描述这张图片：${description}\n\n请用中文回答，描述图片中的主体、背景、风格、颜色等细节。`;

  const messages = [
    { role: 'system', content: '你是一个专业的图像描述助手，请详细描述图片内容。' },
    { role: 'user', content: prompt },
  ];

  // 注意：Seedream 是文生图模型，这里用chat接口可能不行
  // 如果需要文本描述功能，需要另外的文本模型
  throw new SeedreamError(
    'Seedream 是文生图模型，不支持文本对话。如需问答功能，请使用 doubao-seed 系列文本模型。',
    SeedreamErrorType.MODEL_NOT_SUPPORTED
  );
}

/**
 * 测试 API 连接（仅测试连通性）
 *
 * @returns 测试结果
 */
export async function testSeedreamConnection(): Promise<{
  success: boolean;
  message: string;
  modelType?: string;
}> {
  try {
    console.log('[Seedream] 测试连接...');
    // 尝试一个最小的生成请求来测试
    await callSeedreamAPI('test', '', '512x512');
    return {
      success: true,
      message: 'API 连接成功',
      modelType: 'image_generation',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[Seedream] 测试失败:', errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// ============================================
// 便捷导出
// ============================================

export default {
  generateImage,
  describeImage,
  testSeedreamConnection,
  SeedreamError,
  SeedreamErrorType,
};
