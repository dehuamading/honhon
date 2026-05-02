'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCoaxReply } from '@/hooks/useCoaxReply';
import { ReplyStyle, REPLY_STYLES } from '@/lib/cozbApi';
import { cn } from '@/lib/utils';

/**
 * 哄人回复生成器测试页面
 * 用于测试豆包大模型接入是否正常
 */
export default function TestCoaxPage() {
  // 表单状态
  const [angryScene, setAngryScene] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ReplyStyle>('温柔宠溺');

  // 使用 hook
  const { reply, isLoading, error, generate, reset } = useCoaxReply();

  // 处理生成
  const handleGenerate = async () => {
    await generate(angryScene, selectedStyle);
  };

  // 处理复制
  const handleCopy = async () => {
    if (reply) {
      await navigator.clipboard.writeText(reply);
      alert('已复制到剪贴板！');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-blue-100 p-6">
      {/* 顶部导航 */}
      <header className="max-w-2xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <span>←</span>
          <span>返回首页</span>
        </Link>
      </header>

      {/* 主卡片 */}
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            哄人回复生成器
          </h1>
          <p className="text-gray-500 mt-2">
            基于豆包大模型 · 测试页面
          </p>
        </div>

        {/* 场景输入 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述生气的场景
          </label>
          <textarea
            value={angryScene}
            onChange={(e) => setAngryScene(e.target.value)}
            placeholder="例如：女朋友因为我打游戏忽略她生气了，说我只顾着玩游戏不陪她..."
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
              'focus:outline-none focus:border-purple-400',
              'placeholder:text-gray-400',
              'bg-white border-gray-200',
              'resize-none h-32'
            )}
          />
        </div>

        {/* 风格选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择回复风格
          </label>
          <div className="grid grid-cols-3 gap-2">
            {REPLY_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={cn(
                  'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                  selectedStyle === style
                    ? 'bg-purple-500 text-white shadow-md'
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
          disabled={isLoading || angryScene.trim().length < 5}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg mb-6',
            isLoading || angryScene.trim().length < 5
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          {isLoading ? '生成中...' : '生成哄人回复 ✨'}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* 回复结果显示 */}
        {reply && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                生成的回复
              </label>
              <button
                onClick={handleCopy}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                复制内容 📋
              </button>
            </div>
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl text-gray-700 whitespace-pre-wrap">
              {reply}
            </div>
          </div>
        )}

        {/* 帮助信息 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>1. 详细描述对象生气的场景</li>
            <li>2. 选择合适的回复风格</li>
            <li>3. 点击生成，获取哄人回复</li>
            <li>4. 复制回复内容，直接发送给对象</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
