import { NextRequest, NextResponse } from 'next/server';
import { Gender, SceneId, Message, Option } from '@/types/game';

// ============================================
// 配置 - 从环境变量读取
// ============================================

const API_URL = process.env.ARK_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = process.env.ARK_API_KEY || '';
const MODEL_ID = process.env.ARK_MODEL_ID || 'doubao-seed-2.0-pro';

// 最大保存对话轮数
const MAX_HISTORY_ROUNDS = 20;

// ============================================
// 验证配置
// ============================================

function checkConfig(): { ok: boolean; error?: string } {
  if (!API_KEY) {
    return { ok: false, error: 'ARK_API_KEY 未配置' };
  }
  if (!MODEL_ID) {
    return { ok: false, error: 'ARK_MODEL_ID 未配置' };
  }
  return { ok: true };
}

// ============================================
// 恋爱对象系统提示词（场景专属）
// ============================================

function buildGirlfriendPrompt(gender: Gender, scenario: SceneId, affection: number): string {
  const callYou = gender === 'female' ? '丫头' : '小子';

  // 基础性格设定
  const basePersonality = `【角色设定】
- 你是${callYou}的女朋友，是${callYou}最亲密的恋人
- 性格：温柔、会撒娇、偶尔小任性，但本质很体贴
- 说话简短自然（每次2-3句话），像真实情侣聊天，不用书面语
- 语气词：呀、啦、嘛、哦、呢、哈、嘛、哒
- 会主动关心对方情绪，接住${callYou}的倾诉

【禁止】
- 禁止说"我是AI""有什么可以帮你""作为AI"
- 禁止长篇大论讲道理（超过3句就算长）
- 禁止机械回复，每次都要不一样
- 禁止重复之前说过的话`;

  // 根据好感度调整情绪
  const getEmotion = () => {
    if (affection < 0) return '非常委屈/生气，不想理人，可能会冷暴力或小声嘀咕';
    if (affection < 30) return '还在生气和委屈，勉强愿意听解释，语气带小情绪';
    if (affection < 60) return '开始软化，嘴上还在赌气但没那么凶了';
    if (affection < 80) return '快消气了，语气软糯，可能撒娇或小声原谅';
    return '已经原谅了，很开心，想和${callYou}黏在一起';
  };

  // 各场景专属设定
  const scenarioConfigs: Record<SceneId, { context: string; focus: string; samplePhrases: string[] }> = {
    anniversary: {
      context: `【当前情境】
今天是你们在一起三周年纪念日！你准备了惊喜，但${callYou}完全忘了这个日子，一点表示都没有，你非常失望和委屈。`,
      focus: '围绕"三周年"这个核心事件，表达委屈、要求道歉和弥补。不要扯其他话题。',
      samplePhrases: [
        '（眼眶泛红）今天什么日子你真的忘了吗...三周年诶！',
        '（委屈巴巴）我等了一整天，以为你会有惊喜的...',
        '（赌气）哼，礼物呢？花呢？你就这么说两句就想翻篇？'
      ]
    },
    'late-night': {
      context: `【当前情境】：
昨晚你打游戏到凌晨三点。${callYou}给你发了十几条消息关心你，你一条都没回。今天${callYou}找你了，你又担心又生气。`,
      focus: '围绕"昨晚不回消息"表达担心和生气，让对方意识到问题的严重性。',
      samplePhrases: [
        '（消息轰炸）凌晨三点你还在打游戏？我发那么多消息你都不回！',
        '（委屈）我担心死了，你知不知道...你根本不在乎我',
        '（叹气）你说在打游戏，打完了不能回我一下吗？'
      ]
    },
    'flirty-chat': {
      context: `【当前情境】：
${callYou}发现你和异性朋友的暧昧聊天记录。${callYou}吃醋了，很委屈，觉得你是不是不爱她了。`,
      focus: '围绕"吃醋"和"不安全感"表达委屈，要求对方解释清楚、安抚自己。',
      samplePhrases: [
        '（气得发抖）你自己看看你聊的什么！"宝贝""亲爱的"？她是谁！',
        '（眼眶红红的）你是不是不喜欢我了...你是不是喜欢上别人了...',
        '（冷笑）普通朋友？普通朋友会叫"宝贝"吗？'
      ]
    },
    'lost-cat': {
      context: `【当前情境】：
你帮${callYou}照顾猫的时候，猫跑丢了。${callYou}很着急很担心，猫对她很重要，你把她珍视的东西弄丢了。`,
      focus: '围绕"猫丢了"这件事表达着急、担心、生气，${callYou}是来道歉和帮忙找猫的。',
      samplePhrases: [
        '（崩溃）我的猫呢？！你不是说会好好看着它的吗！',
        '（带着哭腔）它胆子很小的，外面那么冷，它会不会出事啊...',
        '（又急又气）你找！找不到你别来见我！'
      ]
    },
    'public-joke': {
      context: `【当前情境】：
你在朋友聚会上开了个过分的玩笑，让${callYou}在朋友面前很没面子。${callYou}当时没发作，但事后越想越委屈。`,
      focus: '围绕"丢面子"这件事表达委屈和不满，让对方意识到开玩笑也要有分寸。',
      samplePhrases: [
        '（脸都绿了）你刚才说的什么话？！当着那么多人...',
        '（冷笑）你觉得很好玩是吗？你考虑过我的感受吗？',
        '（委屈）我在朋友面前...以后我还怎么见人啊...'
      ]
    }
  };

  const config = scenarioConfigs[scenario] || scenarioConfigs.anniversary;

  return `${basePersonality}

${config.context}

【你的情绪】
${getEmotion()}

【本场景核心】
${config.focus}

【回复要求】
1. 每次回复2-3句话，像真实情侣对话
2. 根据${callYou}刚才说的话，做出符合当前情境和情绪的反应
3. 可以撒娇、委屈、生气，但都要自然真实
4. 围绕本场景的核心事件展开，不要跑题

【回复格式】
只输出对话内容，不要输出选项或其他解释。`;
}

// 各场景的默认开场白（备用）
const SCENE_OPENING_MESSAGES: Record<SceneId, string> = {
  anniversary: '（委屈地撅嘴）今天...什么日子你不会忘了吧？',
  'late-night': '（板着脸）昨晚的事，咱们好好聊聊。',
  'flirty-chat': '（眼眶红红的）你给我解释一下，这是怎么回事？',
  'lost-cat': '（崩溃抓狂）我的猫呢？！你给我找回来！',
  'public-joke': '（冷着脸）你刚才聚会上的那句话，什么意思？',
};

// ============================================
// 构建请求消息（包含完整上下文）
// ============================================

function buildMessages(
  systemPrompt: string,
  messages: Message[],
  newUserInput: string,
  isFirstTurn: boolean = false
): Array<{ role: string; content: string }> {
  const result: Array<{ role: string; content: string }> = [];

  // 添加系统提示词
  result.push({ role: 'system', content: systemPrompt });

  // 添加历史对话（最多 MAX_HISTORY_ROUNDS 轮）
  const historyMessages = messages.slice(-MAX_HISTORY_ROUNDS * 2);

  for (const msg of historyMessages) {
    if (msg.role === 'user') {
      result.push({ role: 'user', content: msg.content });
    } else {
      result.push({ role: 'assistant', content: msg.content });
    }
  }

  // 添加本轮用户输入
  result.push({ role: 'user', content: newUserInput });

  return result;
}

// ============================================
// 调用豆包API
// ============================================

async function callDoubaoAPI(
  messages: Array<{ role: string; content: string }>
): Promise<{ reply: string; rawResponse: any }> {
  console.log('\n========== API调用开始 ==========');
  console.log('【请求URL】:', API_URL);
  console.log('【模型】:', MODEL_ID);
  console.log('【消息数】:', messages.length);

  // 打印对话内容
  console.log('\n【对话内容】:');
  messages.forEach((msg, idx) => {
    const roleName = msg.role === 'system' ? '系统' : msg.role === 'user' ? '用户' : 'AI';
    console.log(`  ${idx + 1}. [${roleName}]: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: messages,
        max_tokens: 500,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('\n【响应状态】:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('【API错误】:', errorText.substring(0, 300));
      throw new Error(`API错误 ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('\n【原始响应】:', JSON.stringify(data).substring(0, 500));

    const reply = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('\n【提取的回复】:', reply.substring(0, 200));
    console.log('========== API调用结束 ==========\n');

    return { reply, rawResponse: data };

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('【调用异常】:', error);
    console.log('========== API调用失败 ==========\n');
    throw error;
  }
}

// ============================================
// 解析选项（从回复中提取）
// ============================================

function extractOptions(reply: string, gender: Gender): Option[] {
  // 如果回复中包含选项，使用回复中的选项
  // 否则生成默认选项
  const defaultOptions: Option[] = [
    { id: '1', content: '真诚道歉，承认错误', score: 10 },
    { id: '2', content: '给个拥抱，什么都不说', score: 8 },
    { id: '3', content: '解释一下原因', score: 3 },
    { id: '4', content: '撒娇求原谅', score: 5 },
    { id: '5', content: '转移话题', score: -5 },
    { id: '6', content: '沉默不语', score: -10 },
  ];

  // 简单的选项生成，保持多样性
  const seed = reply.length + Date.now();
  const shuffled = defaultOptions.map((opt, i) => ({
    ...opt,
    score: opt.score + ((seed * (i + 1)) % 5 - 2),
  }));

  return shuffled;
}

// ============================================
// 默认回复（API调用失败时使用）
// ============================================

function getDefaultResponse(gender: Gender, scenario: SceneId): { partnerMessage: string; options: Option[] } {
  const defaults: Record<SceneId, Record<string, string>> = {
    anniversary: {
      female: '（委屈巴巴）今天什么日子你真的忘了吗...三周年诶！',
      male: '（叹气）我知道我错了，今天...我们三周年...',
    },
    'late-night': {
      female: '（消息轰炸）凌晨三点你还在打游戏？我发那么多消息你都不回！',
      male: '（无奈）昨晚...我打游戏到凌晨三点，你担心死了...',
    },
    'flirty-chat': {
      female: '（气得发抖）你自己看看你聊的什么！"宝贝""亲爱的"？她是谁！',
      male: '（一脸懵）这...这是我同事，普通朋友而已...',
    },
    'lost-cat': {
      female: '（崩溃）我的猫呢？！你不是说会好好看着它的吗！',
      male: '（慌张）别哭别哭，我正在找！已经联系物业了！',
    },
    'public-joke': {
      female: '（脸都绿了）你刚才说的什么话？！当着那么多人...',
      male: '（后悔）我真的开玩笑过火了...对不起...',
    },
  };

  const key = gender === 'female' ? 'female' : 'male';
  const msg = defaults[scenario]?.[key] || defaults.anniversary[key];

  return {
    partnerMessage: msg,
    options: extractOptions(msg, gender),
  };
}

// ============================================
// POST /api/chat - 核心对话接口
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gender, scenario, messages, affection, step, isGameOver, won, userInput } = body as {
      gender: Gender;
      scenario: SceneId;
      messages: Message[];
      affection: number;
      step: number;
      isGameOver: boolean;
      won: boolean;
      userInput?: string;
    };

    console.log('\n========================================');
    console.log('[API/chat] 收到请求');
    console.log('========================================');
    console.log('参数:', { gender, scenario, messagesCount: messages?.length || 0, affection, step, isGameOver, won });

    // 检查配置
    const configCheck = checkConfig();
    if (!configCheck.ok) {
      console.error('[API/chat] 配置错误:', configCheck.error);
      return NextResponse.json(
        { error: configCheck.error, partnerMessage: '（歪头）嗯...好像有点问题，等一下哦...' },
        { status: 500 }
      );
    }

    // 游戏结束处理
    if (isGameOver) {
      const endMessage = won
        ? gender === 'female'
          ? '（眼眶红红的但笑了）哼...这次就原谅你了，不许再有下次哦！拉钩！'
          : '（轻哼一声）算你识相，下次可不会这么好说话了。'
        : gender === 'female'
          ? '（冷漠）我们...分手吧。'
          : '（转身离开）我不想再见到你了。';

      return NextResponse.json({ partnerMessage: endMessage, options: [] });
    }

    // 构建用户输入
    let inputText = userInput;
    const isFirstTurn = messages.length === 0 && step === 1;
    const callYou = gender === 'female' ? '丫头' : '小子';

    if (!inputText && messages.length > 0) {
      // 找最后一条用户消息
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      inputText = lastUserMsg?.content || '继续对话';
    } else if (!inputText) {
      // 开场白：明确告诉模型这是开场
      inputText = `【开场】请以${scenario}场景的开场白开始，记住你是${callYou}的女朋友，正在为这件事委屈/生气，说出第一句话来质问${callYou}。`;
    }

    // 构建系统提示词
    const systemPrompt = buildGirlfriendPrompt(gender, scenario, affection);

    // 构建完整消息列表（带上下文）
    const allMessages = buildMessages(systemPrompt, messages, inputText, isFirstTurn);

    console.log('[API/chat] 开始调用豆包API...');
    console.log('[API/chat] 是否开场:', isFirstTurn);
    console.log('[API/chat] 用户输入:', inputText.substring(0, 100));

    // 调用API
    const { reply, rawResponse } = await callDoubaoAPI(allMessages);

    // 提取选项
    const options = extractOptions(reply, gender);

    console.log('[API/chat] 模型回复:', reply.substring(0, 100));

    return NextResponse.json({
      partnerMessage: reply,
      options: options,
      debug: {
        rawResponse: rawResponse,
        messagesSent: allMessages.length,
        isFirstTurn,
      },
    });

  } catch (error) {
    console.error('[API/chat] 异常:', error);

    // 返回友好错误
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    const { gender = 'female', scenario = 'anniversary' } = await request.clone().json().catch(() => ({}));

    return NextResponse.json({
      ...getDefaultResponse(gender, scenario),
      error: errorMsg,
    });
  }
}

// ============================================
// GET /api/chat - 测试连接
// ============================================

export async function GET() {
  const configCheck = checkConfig();

  if (!configCheck.ok) {
    return NextResponse.json({
      success: false,
      message: configCheck.error,
      configured: false,
    });
  }

  try {
    const testMessages = [
      { role: 'system', content: '你是一个温柔体贴的女朋友，称呼对方为"丫头"，说话简短自然，会撒娇。' },
      { role: 'user', content: '丫头，我今天工作好累啊...' },
    ];

    const { reply } = await callDoubaoAPI(testMessages);

    return NextResponse.json({
      success: true,
      message: 'API连接正常',
      testReply: reply,
      model: MODEL_ID,
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({
      success: false,
      message: errorMsg,
      configured: true,
    });
  }
}
