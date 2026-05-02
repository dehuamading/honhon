'use client';

import { useState } from 'react';
import { useCoaxReply } from '@/hooks/useCoaxReply';
import { ReplyStyle, REPLY_STYLES } from '@/lib/cozbApi';
import { cn } from '@/lib/utils';

/**
 * ============================================
 * 哄人回复生成按钮组件
 * ============================================
 * 用于在游戏界面中一键生成哄人回复
 *
 * 使用方式：
 * <CoaxButton angryScene="场景描述" onReplyGenerated={(reply) => {}} />
 */

interface CoaxButtonProps {
  /** 当前生气的场景描述 */
  angryScene: string;
  /** 风格选择回调 */
  onStyleChange?: (style: ReplyStyle) => void;
  /** 生成完成回调 */
  onReplyGenerated?: (reply: string) => void;
  /** 自定义样式 */
  className?: string;
}

export function CoaxButton({
  angryScene,
  onStyleChange,
  onReplyGenerated,
  className,
}: CoaxButtonProps) {
  // 弹窗状态
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ReplyStyle>('温柔宠溺');

  // 使用 hook
  const { reply, isLoading, error, generate } = useCoaxReply();

  // 处理生成
  const handleGenerate = async () => {
    const result = await generate(angryScene, selectedStyle);
    if (result) {
      onReplyGenerated?.(result);
    }
  };

  // 处理风格选择
  const handleStyleSelect = (style: ReplyStyle) => {
    setSelectedStyle(style);
    onStyleChange?.(style);
  };

  // 处理复制
  const handleCopy = async () => {
    if (reply) {
      await navigator.clipboard.writeText(reply);
    }
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium',
          'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
          'hover:shadow-md transition-all duration-200',
          'flex items-center gap-2',
          className
        )}
      >
        <span>✨</span>
        <span>AI 帮我哄</span>
      </button>

      {/* 弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                AI 哄人回复 ✨
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 风格选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择风格
              </label>
              <div className="flex flex-wrap gap-2">
                {REPLY_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleSelect(style)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-all',
                      selectedStyle === style
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={cn(
                'w-full py-3 rounded-xl font-bold transition-all',
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-lg'
              )}
            >
              {isLoading ? '生成中...' : '生成哄人回复 💕'}
            </button>

            {/* 错误提示 */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 回复结果 */}
            {reply && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    生成结果
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    复制 📋
                  </button>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                  {reply}
                </div>
              </div>
            )}

            {/* 提示 */}
            <p className="mt-4 text-xs text-gray-400 text-center">
              生成的回复可直接复制使用哦 💕
            </p>
          </div>
        </div>
      )}
    </>
  );
}
