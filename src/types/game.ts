// ============================================
// 游戏状态类型定义
// ============================================

// 性别类型
export type Gender = 'female' | 'male';

// 语音类型
export type VoiceType =
  | 'gentle-female'   // 温柔女声
  | 'cool-female'     // 霸道御姐
  | 'cute-female'    // 可爱软妹
  | 'deep-male'       // 低沉男声
  | 'gentle-male';    // 温柔男声

// 场景ID
export type SceneId =
  | 'anniversary'   // 忘记纪念日
  | 'late-night'    // 深夜不回消息
  | 'flirty-chat'   // 被发现和异性聊天
  | 'lost-cat'      // 把对方的猫弄丢了
  | 'public-joke';  // 当众让对方没面子

// 场景配置
export interface Scene {
  id: SceneId;
  title: string;
  description: string;
}

// 消息结构
export interface Message {
  id: string;
  role: 'user' | 'partner';  // user = 用户消息, partner = AI消息
  content: string;
}

// 选项结构
export interface Option {
  id: string;
  content: string;
  score: number;  // 好感度变化值，正数加分，负数减分
}

// 游戏阶段
export type GamePhase = 'setup' | 'playing' | 'ended';

// 游戏结果
export type GameResult = 'won' | 'lost' | null;

// 游戏状态
export interface GameState {
  // 当前阶段
  phase: GamePhase;
  // 对方性别
  gender: Gender | null;
  // 当前场景
  scenario: Scene | null;
  // 语音类型
  voiceType: VoiceType | null;
  // 当前回合 (1-10)
  step: number;
  // 好感度 (-50 到 100)
  affection: number;
  // 对话历史
  messages: Message[];
  // 当前选项
  currentOptions: Option[];
  // 是否结束
  gameOver: boolean;
  // 游戏结果
  result: GameResult;
  // 是否正在加载
  isLoading: boolean;
}

// 游戏上下文类型
export interface GameContextType {
  gameState: GameState;
  setGender: (gender: Gender) => void;
  setScenario: (scenario: Scene) => void;
  setVoiceType: (voiceType: VoiceType) => void;
  startGame: () => void;
  selectOption: (option: Option) => void;
  resetGame: () => void;
  addPartnerMessage: (content: string, options: Option[]) => void;
}

// ============================================
// 游戏常量
// ============================================
export const INITIAL_AFFECTION = 20;   // 初始好感度
export const MAX_AFFECTION = 100;       // 最大好感度
export const MIN_AFFECTION = -50;       // 最小好感度
export const WIN_AFFECTION = 80;        // 胜利好感度阈值
export const MAX_ROUNDS = 10;           // 最大回合数

// ============================================
// 预设场景列表
// ============================================
export const SCENES: Scene[] = [
  {
    id: 'anniversary',
    title: '忘记纪念日',
    description: '今天是你们在一起三周年，你完全忘了这个日子...',
  },
  {
    id: 'late-night',
    title: '深夜不回消息',
    description: '你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回...',
  },
  {
    id: 'flirty-chat',
    title: '被发现和异性聊天',
    description: '对方看到你和异性朋友的暧昧聊天记录...',
  },
  {
    id: 'lost-cat',
    title: '把对方的猫弄丢了',
    description: '你帮对方照顾猫的时候，猫跑丢了...',
  },
  {
    id: 'public-joke',
    title: '当众让对方没面子',
    description: '你在朋友聚会上开了一个过分的玩笑...',
  },
];

// ============================================
// 语音配置
// ============================================
export interface VoiceConfig {
  type: VoiceType;
  speaker: string;  // Coze TTS 使用的 speaker ID
  label: string;     // 显示名称
  gender: Gender;    // 适用性别
}

export const VOICE_CONFIGS: VoiceConfig[] = [
  {
    type: 'gentle-female',
    speaker: 'zh_female_xiaohe_uranus_bigtts',
    label: '温柔女声',
    gender: 'female',
  },
  {
    type: 'cool-female',
    speaker: 'zh_female_vv_uranus_bigtts',
    label: '霸道御姐',
    gender: 'female',
  },
  {
    type: 'cute-female',
    speaker: 'saturn_zh_female_keainvsheng_tob',
    label: '可爱软妹',
    gender: 'female',
  },
  {
    type: 'deep-male',
    speaker: 'zh_male_m191_uranus_bigtts',
    label: '低沉男声',
    gender: 'male',
  },
  {
    type: 'gentle-male',
    speaker: 'zh_male_taocheng_uranus_bigtts',
    label: '温柔男声',
    gender: 'male',
  },
];

// 根据性别获取语音列表
export function getVoicesByGender(gender: Gender): VoiceConfig[] {
  return VOICE_CONFIGS.filter((v) => v.gender === gender);
}

// 获取指定语音配置
export function getVoiceConfig(type: VoiceType): VoiceConfig | undefined {
  return VOICE_CONFIGS.find((v) => v.type === type);
}
