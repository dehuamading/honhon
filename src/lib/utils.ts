import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 清理文本中的括号内容（用于TTS）
 * 去掉括号里的动作描述和情绪提示
 */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/（[^）]*）/g, '')  // 去掉中文括号
    .replace(/\([^)]*\)/g, '')    // 去掉英文括号
    .replace(/\[[^\]]*\]/g, '')   // 去掉中括号
    .replace(/[「」『』]/g, '')    // 去掉其他标点
    .trim();
}

/**
 * 获取好感度对应的颜色
 */
export function getAffectionColor(affection: number): string {
  if (affection < 0) return '#ef4444';    // 红色 - 危险
  if (affection < 40) return '#f97316';   // 橙色 - 紧张
  if (affection < 80) return '#eab308';   // 黄色 - 一般
  return '#22c55e';                        // 绿色 - 成功
}

/**
 * 获取好感度状态文字
 */
export function getAffectionStatus(affection: number): string {
  if (affection < 0) return '非常生气 💢';
  if (affection < 40) return '有点生气 😠';
  if (affection < 80) return '渐渐消气 😊';
  return '原谅你了 💕';
}

/**
 * 随机打乱数组
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
