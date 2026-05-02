'use client';

import { useGame } from '@/context/GameContext';

interface ResultViewProps {
  isWin: boolean;
}

export function ResultView({ isWin }: ResultViewProps) {
  const { gameState, resetGame } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* 结果卡片 */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* 动画图标 */}
        <div className="mb-6">
          {isWin ? (
            <div className="relative">
              {/* 撒花动画 */}
              <span className="text-7xl animate-bounce-slow inline-block">🎉</span>
              {/* 彩带 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'][i % 4],
                      left: `${50 + Math.cos(i * Math.PI / 4) * 60}%`,
                      top: `${50 + Math.sin(i * Math.PI / 4) * 60}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <span className="text-7xl animate-heartbeat inline-block">💔</span>
          )}
        </div>

        {/* 标题 */}
        <h1 className={`text-3xl font-bold mb-4 ${isWin ? 'text-green-600' : 'text-red-600'}`}>
          {isWin ? '恭喜通关！🎊' : '游戏结束'}
        </h1>

        {/* 结局对话 */}
        <div className={`p-4 rounded-xl mb-6 ${isWin ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-lg ${isWin ? 'text-green-800' : 'text-red-800'}`}>
            {gameState.messages[gameState.messages.length - 1]?.content ||
              (isWin
                ? '这次就原谅你了，不过你要保证以后不许再犯同样的错误！'
                : '我们已经没有可能了...')}
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-3 rounded-xl ${isWin ? 'bg-green-50' : 'bg-gray-100'}`}>
            <p className="text-sm text-gray-500">最终好感度</p>
            <p className={`text-2xl font-bold ${isWin ? 'text-green-600' : 'text-gray-600'}`}>
              {gameState.affection}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${isWin ? 'bg-green-50' : 'bg-gray-100'}`}>
            <p className="text-sm text-gray-500">进行回合</p>
            <p className={`text-2xl font-bold ${isWin ? 'text-green-600' : 'text-gray-600'}`}>
              {Math.min(gameState.step, 10)}
            </p>
          </div>
        </div>

        {/* 分享文案 */}
        <p className={`text-sm mb-6 ${isWin ? 'text-green-600' : 'text-gray-500'}`}>
          {isWin
            ? '通关了！快分享给朋友试试你能哄好TA吗？'
            : '再试一次？也许下次就能成功了！'}
        </p>

        {/* 按钮 */}
        <div className="space-y-3">
          <button
            onClick={resetGame}
            className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl ${
              isWin
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            再哄一次
          </button>
        </div>
      </div>

      {/* 装饰 */}
      <p className="mt-6 text-sm text-gray-500">哄哄模拟器</p>
    </div>
  );
}
