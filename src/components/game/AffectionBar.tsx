'use client';

import { useGame } from '@/context/GameContext';
import { getAffectionColor, getAffectionStatus } from '@/lib/utils';

export function AffectionBar() {
  const { gameState } = useGame();
  const { affection, step } = gameState;

  // 计算进度条宽度百分比（基于 -50 到 100 的范围）
  const percentage = ((affection + 50) / 150) * 100;
  const color = getAffectionColor(affection);
  const status = getAffectionStatus(affection);

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      {/* 顶部信息 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          第 {step} 轮 / 共 10 轮
        </span>
        <span className="text-sm font-medium text-gray-600">
          {status}
        </span>
      </div>

      {/* 进度条容器 */}
      <div className="relative">
        {/* 背景条 */}
        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
          {/* 填充条 - 使用原生div实现 */}
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(0, Math.min(100, percentage))}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* 中心刻度标记 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full flex items-center">
          <div className="w-0.5 h-6 bg-gray-400 rounded-full" />
        </div>
      </div>

      {/* 底部数值 */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">-50</span>
        <span
          className="text-lg font-bold"
          style={{ color }}
        >
          好感度: {affection}
        </span>
        <span className="text-xs text-gray-500">+100</span>
      </div>
    </div>
  );
}
