'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { ResultView } from '@/components/result/ResultView';
import { cn } from '@/lib/utils';

export default function ResultPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { gameState, resetGame } = useGame();

  // 如果游戏未结束或未登录，重定向
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (gameState.phase !== 'ended') {
      router.push('/');
      return;
    }
  }, [gameState.phase, isLoggedIn, authLoading, router]);

  // 处理重置
  const handleReset = () => {
    resetGame();
    router.push('/');
  };

  // 处理再玩一次
  const handlePlayAgain = () => {
    resetGame();
    router.push('/');
  };

  // 加载状态
  if (authLoading || gameState.phase !== 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💕</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">正在跳转...</p>
        </div>
      </div>
    );
  }

  // 渲染结果
  const isWin = gameState.result === 'won';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-blue-100">
      <ResultView isWin={isWin} />

      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex gap-4">
          <button
            onClick={handlePlayAgain}
            className={cn(
              'flex-1 py-3 rounded-xl font-bold transition-all duration-300',
              'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white',
              'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            再玩一次
          </button>
          <button
            onClick={handleReset}
            className={cn(
              'flex-1 py-3 rounded-xl font-bold transition-all duration-300',
              'border-2 border-gray-300 text-gray-600',
              'hover:bg-gray-50'
            )}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
