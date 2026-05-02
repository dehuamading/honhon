'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { AffectionBar } from '@/components/game/AffectionBar';
import { ChatBubble } from '@/components/game/ChatBubble';
import { OptionButton } from '@/components/game/OptionButton';
import { LoadingDots } from '@/components/game/LoadingDots';
import { Option, Message } from '@/types/game';
import { shuffleArray } from '@/lib/utils';

export default function GamePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const {
    gameState,
    addPartnerMessage,
    selectOption,
    resetGame,
  } = useGame();

  const {
    phase,
    gender,
    scenario,
    step,
    messages,
    currentOptions,
    isLoading,
    gameOver,
    affection,
  } = gameState;

  // 用于跟踪生成状态的ref - 使用useRef确保稳定性
  const isGeneratingRef = useRef(false);
  const lastGeneratedStepRef = useRef(0);
  const lastGeneratedScenarioRef = useRef<string | null>(null);  // 新增：追踪上一个场景
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 生成下一轮对话 - 使用useCallback确保函数引用稳定
  const generateNextRound = useCallback(async () => {
    // 防止重复生成
    if (isGeneratingRef.current) {
      console.log('[Game] Already generating, skipping');
      return;
    }
    if (gameOver) {
      console.log('[Game] Game over, skipping');
      return;
    }

    // 检查是否需要生成
    // 场景改变时必须重新生成，step改变时也必须重新生成
    const currentScenarioId = scenario?.id || null;
    const scenarioChanged = currentScenarioId !== lastGeneratedScenarioRef.current;
    const stepChanged = step !== lastGeneratedStepRef.current;

    console.log('[Game] Generating round check', {
      step,
      lastStep: lastGeneratedStepRef.current,
      scenario: currentScenarioId,
      lastScenario: lastGeneratedScenarioRef.current,
      scenarioChanged,
      stepChanged,
      messagesCount: messages.length
    });

    // 只有在同一场景且同一step下才跳过（避免重复生成）
    if (!scenarioChanged && !stepChanged && messages.length > 0) {
      console.log('[Game] Skipping - same scenario and step already generated');
      return;
    }

    console.log('[Game] Generating NEW round for', { scenario: currentScenarioId, step });
    isGeneratingRef.current = true;

    try {
      // 构建对话历史（使用最新的messages）
      const chatMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));

      console.log('[Game] Calling API with', { step, messagesCount: chatMessages.length });

      // 调用API生成对话
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender,
          scenario: scenario?.id,
          messages: chatMessages,
          affection,
          step,
          isGameOver: false,
          won: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${errorData.message || ''}`);
      }

      const data = await response.json();
      console.log('[Game] API response received', {
        hasOptions: !!data.options,
        optionCount: data.options?.length || 0,
        messageLength: data.partnerMessage?.length || 0
      });

      if (!data.partnerMessage) {
        throw new Error('No partner message in response');
      }

      // 随机打乱选项顺序
      const shuffledOptions = (data.options || []).map(
        (opt: Partial<Option>, idx: number) => ({
          id: opt.id || String(idx + 1),
          content: opt.content || '',
          score: opt.score || 0,
        })
      );

      // 添加AI消息和选项
      addPartnerMessage(data.partnerMessage, shuffledOptions);
      // 重要：更新追踪ref
      lastGeneratedStepRef.current = step;
      lastGeneratedScenarioRef.current = currentScenarioId;

      console.log('[Game] Message added successfully', {
        step,
        scenario: currentScenarioId,
        replyPreview: data.partnerMessage.substring(0, 50)
      });
    } catch (error) {
      console.error('[Game] Error generating response:', error);
      // 发生错误时添加默认消息，但仍需更新step追踪
      addPartnerMessage(
        gender === 'female'
          ? '（委屈地撅嘴）你...你又惹我生气了...'
          : '（叹气）你就不能认真听我说吗...',
        [
          { id: '1', content: '真诚道歉，承认错误', score: 10 },
          { id: '2', content: '解释一下原因', score: 5 },
          { id: '3', content: '试图转移话题', score: -5 },
          { id: '4', content: '沉默不语', score: -10 },
          { id: '5', content: '反驳回去', score: -20 },
          { id: '6', content: '做出离谱的承诺', score: -25 },
        ]
      );
      // 即使API失败，也更新追踪ref，避免死循环
      lastGeneratedStepRef.current = step;
      lastGeneratedScenarioRef.current = currentScenarioId;
    } finally {
      isGeneratingRef.current = false;
    }
  }, [gender, scenario, messages, affection, step, gameOver, addPartnerMessage]);

  // 初始化游戏或检测阶段变化
  useEffect(() => {
    console.log('[Game] Effect triggered', { phase, gameOver, authLoading, isLoggedIn });

    // 等待登录状态检查完成
    if (authLoading) {
      console.log('[Game] Auth loading, waiting');
      return;
    }

    // 未登录，重定向到登录页
    if (!isLoggedIn) {
      console.log('[Game] Not logged in, redirecting');
      router.push('/login');
      return;
    }

    if (phase === 'setup') {
      console.log('[Game] Phase is setup, redirecting to home');
      resetGame();
      router.push('/');
      return;
    }

    if (phase === 'ended') {
      console.log('[Game] Phase is ended, redirecting to result');
      router.push('/result');
      return;
    }

    if (phase === 'playing' && !gameOver) {
      console.log('[Game] Starting new round');
      generateNextRound();
    }
  }, [phase, gameOver, authLoading, isLoggedIn, router, generateNextRound, resetGame]);

  // 滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 处理选择选项
  const handleSelectOption = useCallback((option: Option) => {
    console.log('[Game] Option selected', { option: option.id, isLoading, optionsCount: currentOptions.length });

    if (isLoading || currentOptions.length === 0) {
      console.log('[Game] Cannot select - loading or no options', { isLoading, optionsCount: currentOptions.length });
      return;
    }

    // 选择选项
    selectOption(option);
  }, [isLoading, currentOptions.length, selectOption]);

  // 加载状态
  if (authLoading || phase === 'setup') {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-md p-4">
        <div className="max-w-2xl mx-auto">
          <AffectionBar />
        </div>
      </header>

      {/* 对话区域 */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* 场景信息 */}
          {scenario && (
            <div className="text-center mb-4 p-2 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">
                场景：{scenario.title}
              </span>
            </div>
          )}

          {/* 调试信息 - 开发时可见 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mb-2 p-2 bg-gray-100 rounded">
              调试: step={step}, isLoading={String(isLoading)}, messages={messages.length}, options={currentOptions.length}
            </div>
          )}

          {/* 消息列表 */}
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>

          {/* 加载动画 */}
          {isLoading && <LoadingDots />}

          {/* 空状态 */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p>游戏加载中...</p>
            </div>
          )}

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部选项区域 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          {currentOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {currentOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  option={option}
                  onClick={handleSelectOption}
                  disabled={isLoading}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-4 text-gray-400">
              等待下一回合...
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              她正在思考...
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
