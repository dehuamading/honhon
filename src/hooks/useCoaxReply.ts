'use client';

import { useState, useCallback } from 'react';
import { ReplyStyle } from '@/lib/cozbApi';

/**
 * ============================================
 * 哄人回复生成 Hook
 * ============================================
 * 用于在组件中生成哄人回复
 *
 * @example
 * ```tsx
 * const { generate, reply, isLoading, error } = useCoaxReply();
 *
 * const handleGenerate = async () => {
 *   await generate("女朋友生气了", "温柔宠溺");
 * };
 * ```
 */

// 返回类型
export interface UseCoaxReplyReturn {
  // 生成的回复
  reply: string;
  // 是否正在生成
  isLoading: boolean;
  // 错误信息
  error: string;
  // 生成函数
  generate: (angryScene: string, replyStyle?: ReplyStyle) => Promise<string | null>;
  // 重置状态
  reset: () => void;
}

/**
 * 哄人回复生成 Hook
 */
export function useCoaxReply(): UseCoaxReplyReturn {
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 生成哄人回复
   */
  const generate = useCallback(
    async (angryScene: string, replyStyle: ReplyStyle = '温柔宠溺'): Promise<string | null> => {
      // 参数校验
      if (!angryScene || angryScene.trim().length < 5) {
        setError('请详细描述生气的场景（至少5个字）');
        return null;
      }

      setIsLoading(true);
      setError('');
      setReply('');

      try {
        const response = await fetch('/api/coax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            angryScene: angryScene.trim(),
            replyStyle,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setReply(data.reply);
          return data.reply;
        } else {
          setError(data.error || '生成失败');
          return null;
        }
      } catch (err) {
        console.error('[useCoaxReply] Error:', err);
        setError('网络错误，请稍后重试');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setReply('');
    setError('');
    setIsLoading(false);
  }, []);

  return {
    reply,
    isLoading,
    error,
    generate,
    reset,
  };
}
