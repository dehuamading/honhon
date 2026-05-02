'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { GenderSelector } from '@/components/setup/GenderSelector';
import { SceneSelector } from '@/components/setup/SceneSelector';
import { VoiceSelector } from '@/components/setup/VoiceSelector';
import { SCENES } from '@/types/game';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn, logout } = useAuth();
  const { gameState, setGender, setScenario, setVoiceType, startGame } = useGame();
  const { gender, scenario, voiceType } = gameState;

  // 检查是否可以开始游戏
  const canStart = gender && scenario && voiceType;

  // 处理开始游戏
  const handleStart = () => {
    if (canStart) {
      startGame();
      router.push('/game');
    }
  };

  // 处理退出登录
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // 加载中状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💕</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录状态 - 显示登录注册引导
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* 主卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
              哄哄模拟器
            </h1>
            <p className="text-gray-500">
              你能在10轮内把TA哄好吗？
            </p>
          </div>

          {/* 欢迎信息 */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              这是一款 AI 驱动的情侣互动游戏
              <br />
              你需要通过选择正确的对话来哄好生气的TA
            </p>
          </div>

          {/* 登录/注册按钮 */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full py-4 rounded-2xl font-bold text-lg text-center transition-all duration-300 shadow-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              登录账号
            </Link>
            <Link
              href="/register"
              className="block w-full py-4 rounded-2xl font-bold text-lg text-center transition-all duration-300 border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              注册账号
            </Link>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-sm text-gray-500 max-w-md">
          <p>游戏规则：</p>
          <p className="mt-1">
            每轮有6个选项，选择正确的对话来提升好感度。
            <br />
            好感度达到80即可通关，但别让好感度降到-50以下！
          </p>
        </div>
      </div>
    );
  }

  // 已登录状态 - 显示游戏设置
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部用户栏 */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm shadow-md p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <span className="font-medium text-gray-700">
              你好，{user?.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* 主卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
              哄哄模拟器
            </h1>
            <p className="text-gray-500">
              你能在10轮内把TA哄好吗？
            </p>
          </div>

          {/* 选择表单 */}
          <div className="space-y-6">
            {/* 性别选择 */}
            <GenderSelector
              value={gender}
              onChange={setGender}
            />

            {/* 场景选择 */}
            <SceneSelector
              value={scenario}
              onChange={setScenario}
              scenes={SCENES}
            />

            {/* 语音选择 */}
            <VoiceSelector
              value={voiceType}
              onChange={setVoiceType}
              gender={gender}
            />
          </div>

          {/* 开始按钮 */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={cn(
              'w-full mt-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg',
              canStart
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            开始游戏 🎮
          </button>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-sm text-gray-500 max-w-md">
          <p>游戏规则：</p>
          <p className="mt-1">
            每轮有6个选项，选择正确的对话来提升好感度。
            <br />
            好感度达到80即可通关，但别让好感度降到-50以下！
          </p>
        </div>
      </div>
    </div>
  );
}
