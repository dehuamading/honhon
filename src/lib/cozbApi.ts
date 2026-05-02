/**
 * ============================================
 * 豆包大模型哄人回复生成工具
 * ============================================
 * 基于火山方舟（Volcano Ark）豆包大模型
 * 专为"哄恋爱对象"场景设计的回复生成
 *
 * 使用方式：
 * 1. 配置环境变量 VOLC_API_KEY 和 VOLC_MODEL_ID
 * 2. 调用 generateCoaxReply(angryScene, replyStyle) 生成哄人回复
 */

// ============================================
// 配置常量
// ============================================

// 火山方舟 API 地址
const API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 模型 ID（默认使用豆包 lite 模型）
const DEFAULT_MODEL_ID = process.env.DOUBAO_MODEL_ID || 'doubao-seed-1-6-lite-251015';

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 30000;

// 最大回复长度（字符数）
const MAX_REPLY_LENGTH = 200;

// ============================================
// 回复风格枚举
// ============================================

/**
 * 可选的回复风格
 * - 温柔宠溺：体贴入微的关心
 * - 撒娇：软萌可爱风格
 * - 霸道：强势护短风格
 * - 暖心：温暖实用风格
 * - 幽默：轻松搞笑风格
 * - 共情：先认可对方情绪
 */
export type ReplyStyle =
  | '温柔宠溺'
  | '撒娇'
  | '霸道'
  | '暖心'
  | '幽默'
  | '共情';

// 回复风格集合（用于校验）
export const REPLY_STYLES: ReplyStyle[] = [
  '温柔宠溺',
  '撒娇',
  '霸道',
  '暖心',
  '幽默',
  '共情',
];

// ============================================
// System 提示词
// ============================================

/**
 * 生成角色预设提示词
 * @param style 回复风格
 * @returns 完整的 system prompt
 */
function buildSystemPrompt(style: ReplyStyle): string {
  const basePrompt = `你是一个专业的情感哄人助手，擅长针对恋爱对象生气的场景，生成真诚、有温度、不敷衍的哄人回复，语言贴合年轻人聊天风格，拒绝生硬、模板化的内容，优先共情对方情绪，再给出暖心的安抚`;

  // 根据风格添加额外要求
  const styleRequirements: Record<ReplyStyle, string> = {
    '温柔宠溺': '语气温柔体贴，展现出对对方的宠爱和包容，让对方感受到被珍视',
    '撒娇': '语气软萌可爱，适当使用撒娇词汇如"呜呜"、"人家"、"嘛"，拉近距离',
    '霸道': '语气强势护短，表明立场"我的人不许欺负"，给对方安全感',
    '暖心': '给出具体可行的弥补方案，语言朴实真挚，让对方感到被照顾',
    '幽默': '用轻松搞笑的方式化解尴尬，适当自嘲或调侃，但不失真诚',
    '共情': '首先深度认可对方的情绪，表明完全理解她的感受，再慢慢安抚',
  };

  return `${basePrompt}。

回复风格要求：${styleRequirements[style]}

重要规则：
1. 回复必须控制在100字以内，简短实用
2. 直接可用，无需修改
3. 不要使用表情包符号（如~^o^~），使用自然的中文标点和少量emoji
4. 语言要像真人聊天，避免书面语`;
}

// ============================================
// 用户提示词构建
// ============================================

/**
 * 构建用户提示词
 * @param angryScene 生气场景描述
 * @returns 构造的用户提示词
 */
function buildUserPrompt(angryScene: string): string {
  return `帮我生成一段哄女朋友的回复。

生气场景：${angryScene}

要求：生成一段简短（100字以内）、真诚、可直接发送的哄人回复。`;
}

// ============================================
// API 调用函数
// ============================================

/**
 * 调用豆包大模型 API
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户提示词
 * @param modelId 模型 ID
 * @returns 模型回复内容
 */
async function callDoubaoAPI(
  systemPrompt: string,
  userPrompt: string,
  modelId: string
): Promise<string> {
  // 从环境变量获取 API Key
  const apiKey = process.env.DOUBAO_API_KEY;

  if (!apiKey) {
    throw new Error('API_KEY_NOT_CONFIGURED');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    // 根据状态码判断错误类型
    if (response.status === 401) {
      throw new Error('API_KEY_INVALID');
    } else if (response.status === 429) {
      throw new Error('API_RATE_LIMITED');
    } else {
      throw new Error(`API_ERROR:${response.status}`);
    }
  }

  const data = await response.json();

  // 提取模型回复
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('API_NO_RESPONSE');
  }

  return content.trim();
}

// ============================================
// 核心函数：生成哄人回复
// ============================================

/**
 * 生成哄人回复
 *
 * @param angryScene - 必填，用户输入的对象生气场景
 *                   例如："女朋友因为我打游戏忽略她生气了"
 * @param replyStyle - 可选，回复风格，默认"温柔宠溺"
 *                   可选值：撒娇、霸道、暖心、幽默、共情
 * @returns 生成的哄人回复（字符串，200字以内）
 *
 * @example
 * // 基本用法
 * const reply = await generateCoaxReply("女朋友因为我打游戏忽略她生气了");
 * console.log(reply); // "宝贝对不起嘛～我刚才打游戏太专注了，忽略了你，我知道错了..."
 *
 * // 指定风格
 * const reply = await generateCoaxReply("女朋友生气了", "霸道");
 * console.log(reply); // "我的人我自己疼！谁惹你生气了告诉我，我去收拾他..."
 */
export async function generateCoaxReply(
  angryScene: string,
  replyStyle: ReplyStyle = '温柔宠溺'
): Promise<string> {
  // ========== 参数校验 ==========
  if (!angryScene || typeof angryScene !== 'string') {
    throw new Error('SCENE_REQUIRED');
  }

  // 校验回复风格
  if (!REPLY_STYLES.includes(replyStyle)) {
    replyStyle = '温柔宠溺'; // 默认回退
  }

  // ========== 场景描述校验 ==========
  const trimmedScene = angryScene.trim();
  if (trimmedScene.length < 5) {
    throw new Error('SCENE_TOO_SHORT');
  }

  try {
    // ========== 构建提示词 ==========
    const systemPrompt = buildSystemPrompt(replyStyle);
    const userPrompt = buildUserPrompt(trimmedScene);

    // ========== 调用 API ==========
    const modelId = process.env.DOUBAO_MODEL_ID || DEFAULT_MODEL_ID;
    let reply = await callDoubaoAPI(systemPrompt, userPrompt, modelId);

    // ========== 后处理 ==========
    // 移除可能的引号
    reply = reply.replace(/^["""]|["""]$/g, '');

    // 移除可能的"以下是回复："等前缀
    reply = reply.replace(/^(以下是|这里有|给你|回复[：:])/g, '');

    // 限制最大长度
    if (reply.length > MAX_REPLY_LENGTH) {
      // 在句子结束后截断
      const truncated = reply.substring(0, MAX_REPLY_LENGTH);
      const lastPunctuation = Math.max(
        truncated.lastIndexOf('。'),
        truncated.lastIndexOf('！'),
        truncated.lastIndexOf('？')
      );
      reply = lastPunctuation > MAX_REPLY_LENGTH * 0.7
        ? truncated.substring(0, lastPunctuation + 1)
        : truncated + '...';
    }

    return reply;

  } catch (error) {
    // ========== 错误处理 ==========
    const errorMessage = error instanceof Error ? error.message : String(error);

    // 错误日志
    console.error('[豆包API] 生成哄人回复失败:', errorMessage);

    // 根据错误类型返回友好提示
    if (errorMessage === 'API_KEY_NOT_CONFIGURED') {
      return '哎呀，API配置不完整～请联系管理员检查设置哦😘';
    } else if (errorMessage === 'API_KEY_INVALID') {
      return '哎呀，API密钥好像过期了～请联系管理员处理哦😘';
    } else if (errorMessage === 'API_RATE_LIMITED') {
      return '访问太频繁啦，休息一下再试吧～😘';
    } else if (errorMessage === 'API_NO_RESPONSE') {
      return '哎呀，暂时没生成出贴心回复～换个场景描述试试吧😘';
    } else if (errorMessage === 'SCENE_REQUIRED') {
      return '请先描述一下生气的场景哦～😘';
    } else if (errorMessage === 'SCENE_TOO_SHORT') {
      return '场景描述太短啦，详细一点我才能生成更贴心的回复哦～😘';
    } else {
      // 网络错误或其他错误
      return '哎呀，暂时没生成出贴心回复～换个场景描述试试吧😘';
    }
  }
}

// ============================================
// 测试函数
// ============================================

/**
 * 测试哄人回复生成功能
 * 传入测试场景，验证功能是否正常
 */
export async function testGenerateCoaxReply(): Promise<void> {
  console.log('========================================');
  console.log('豆包大模型哄人回复生成 - 功能测试');
  console.log('========================================\n');

  // 测试场景
  const testScene = '女朋友生气了怎么哄';

  // 测试不同风格
  const styles: ReplyStyle[] = ['温柔宠溺', '撒娇', '霸道', '暖心', '幽默', '共情'];

  for (const style of styles) {
    console.log(`\n【${style}风格】`);
    console.log('场景:', testScene);
    console.log('生成中...');

    try {
      const reply = await generateCoaxReply(testScene, style);
      console.log('回复:', reply);
    } catch (error) {
      console.error('生成失败:', error);
    }

    // 添加间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 如果直接运行此文件，执行测试
// 使用方式: npx ts-node src/lib/cozbApi.ts
// 或: node src/lib/cozbApi.js (需先编译)
if (require.main === module) {
  testGenerateCoaxReply().catch(console.error);
}
