/**
 * ============================================
 * 豆包大模型 API 客户端
 * ============================================
 * 火山方舟 v3 API，OpenAI 兼容格式
 * 接入点ID: ep-20260426182719-z7z5l
 */

// ============================================
// 配置
// ============================================

const API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const MODEL_ID = process.env.DOUBAO_MODEL_ID || 'ep-20260426182719-z7z5l';
const REQUEST_TIMEOUT = 60000;

// ============================================
// 类型定义
// ============================================

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DoubaoResponse {
  content: string;
  id?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

// ============================================
// 错误类型
// ============================================

enum DoubaoErrorType {
  CONFIG_MISSING = 'CONFIG_MISSING',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  TIMEOUT = 'TIMEOUT',
}

class DoubaoError extends Error {
  constructor(
    message: string,
    public type: DoubaoErrorType,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'DoubaoError';
  }
}

// ============================================
// 验证配置
// ============================================

function validateConfig(): string {
  const apiKey = process.env.DOUBAO_API_KEY;
  if (!apiKey || apiKey.includes('你的APIKey') || apiKey.length < 10) {
    throw new DoubaoError(
      'DOUBAO_API_KEY 未配置或为占位符，请检查 .env.local',
      DoubaoErrorType.CONFIG_MISSING
    );
  }
  return apiKey;
}

// ============================================
// 核心API调用
// ============================================

/**
 * 调用豆包大模型 API
 * @param messages 消息列表
 * @param temperature 温度参数
 * @param maxTokens 最大token数
 */
async function callAPI(
  messages: ChatMessage[],
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<DoubaoResponse> {
  const apiKey = validateConfig();

  console.log('[Doubao] 调用 API，接入点:', MODEL_ID);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `API错误: ${response.status}`;

      if (response.status === 401) {
        errorMsg = 'API密钥无效或已过期';
      } else if (response.status === 403) {
        errorMsg = 'API访问被拒绝，请检查权限';
      } else if (response.status === 429) {
        errorMsg = '请求过于频繁，请稍后再试';
      }

      console.error('[Doubao] API错误:', errorText.substring(0, 200));
      throw new DoubaoError(errorMsg, DoubaoErrorType.API_ERROR, response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new DoubaoError('API返回内容为空', DoubaoErrorType.EMPTY_RESPONSE);
    }

    return {
      content,
      id: data.id,
      usage: data.usage,
      model: data.model,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DoubaoError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new DoubaoError(`请求超时（${REQUEST_TIMEOUT / 1000}秒）`, DoubaoErrorType.TIMEOUT);
      }
      throw new DoubaoError(`网络错误: ${error.message}`, DoubaoErrorType.NETWORK_ERROR);
    }

    throw new DoubaoError('未知错误', DoubaoErrorType.API_ERROR);
  }
}

// ============================================
// 公开接口
// ============================================

/**
 * 简单的问答对话
 * @param question 用户问题
 * @param systemPrompt 系统提示词（可选）
 */
export async function ask(
  question: string,
  systemPrompt: string = '你是一个有帮助的AI助手，请用中文回答。'
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  const result = await callAPI(messages);
  return result.content;
}

/**
 * 通用对话接口
 * @param userMessage 用户消息
 * @param systemPrompt 系统提示词（可选）
 */
export async function chat(
  userMessage: string,
  systemPrompt: string = '你是一个有帮助的AI助手，请用中文回答。'
): Promise<DoubaoResponse> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  return await callAPI(messages);
}

/**
 * 带上下文的对话
 * @param messages 对话历史（不含system）
 * @param systemPrompt 系统提示词
 */
export async function chatWithContext(
  messages: ChatMessage[],
  systemPrompt: string = '你是一个有帮助的AI助手，请用中文回答。'
): Promise<DoubaoResponse> {
  const allMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  return await callAPI(allMessages);
}

/**
 * 测试连接
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await ask('请回复"测试成功"');
    return { success: true, message: result };
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误';
    return { success: false, message: msg };
  }
}

// 导出类型和错误类
export { DoubaoError, DoubaoErrorType };
export default { ask, chat, chatWithContext, testConnection };
