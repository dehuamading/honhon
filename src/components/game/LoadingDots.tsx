'use client';

import { useGame } from '@/context/GameContext';

export function LoadingDots() {
  const { gameState } = useGame();
  const gender = gameState.gender === 'female' ? '她' : '他';

  return (
    <div className="flex items-center gap-3 p-4">
      {/* 头像 */}
      <div className="w-10 h-10 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
        TA
      </div>

      {/* 加载动画 */}
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>

      {/* 思考文字 */}
      <span className="text-sm text-gray-500 animate-pulse">
        {gender}正在思考...
      </span>
    </div>
  );
}
