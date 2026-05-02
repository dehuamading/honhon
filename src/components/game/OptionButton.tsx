'use client';

import { Option } from '@/types/game';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  option: Option;
  onClick: (option: Option) => void;
  disabled?: boolean;
}

export function OptionButton({ option, onClick, disabled = false }: OptionButtonProps) {
  const isPositive = option.score > 0;

  return (
    <button
      onClick={() => onClick(option)}
      disabled={disabled}
      className={cn(
        'w-full min-h-[56px] p-4 rounded-xl text-left transition-all duration-200',
        'border-2 shadow-sm hover:shadow-md',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isPositive
          ? 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400'
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* 指示器 */}
        <span
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs',
            isPositive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
          )}
        >
          {isPositive ? '+' : '-'}
        </span>

        {/* 选项内容 */}
        <span className="text-gray-700 leading-relaxed break-words">
          {option.content}
        </span>
      </div>
    </button>
  );
}
