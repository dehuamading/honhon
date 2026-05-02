'use client';

import { Message } from '@/types/game';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

export function ChatBubble({ message, showAvatar = true }: ChatBubbleProps) {
  const isPartner = message.role === 'partner';

  return (
    <div
      className={cn(
        'flex items-end gap-2 mb-3',
        isPartner ? 'justify-start' : 'justify-end'
      )}
    >
      {/* 头像 */}
      {showAvatar && (
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
            isPartner
              ? 'bg-pink-400 text-white'
              : 'bg-blue-500 text-white'
          )}
        >
          {isPartner ? 'TA' : '我'}
        </div>
      )}

      {/* 气泡 */}
      <div
        className={cn(
          'max-w-[75%] px-4 py-2.5 shadow-md',
          isPartner
            ? 'bg-white rounded-bl-md rounded-br-lg text-gray-800'
            : 'bg-blue-500 rounded-bl-lg rounded-br-md text-white'
        )}
      >
        {/* 内容 */}
        <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
          {message.content}
        </p>
      </div>
    </div>
  );
}
