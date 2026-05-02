'use client';

import { Gender } from '@/types/game';
import { cn } from '@/lib/utils';

interface GenderSelectorProps {
  value: Gender | null;
  onChange: (gender: Gender) => void;
}

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        选择对方性别
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* 女选项 */}
        <button
          onClick={() => onChange('female')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all duration-200',
            'flex flex-col items-center gap-2',
            value === 'female'
              ? 'border-pink-500 bg-pink-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-pink-300'
          )}
        >
          <span className="text-3xl">👩</span>
          <span className={cn(
            'text-sm font-medium',
            value === 'female' ? 'text-pink-600' : 'text-gray-600'
          )}>
            女
          </span>
        </button>

        {/* 男选项 */}
        <button
          onClick={() => onChange('male')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all duration-200',
            'flex flex-col items-center gap-2',
            value === 'male'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-blue-300'
          )}
        >
          <span className="text-3xl">👨</span>
          <span className={cn(
            'text-sm font-medium',
            value === 'male' ? 'text-blue-600' : 'text-gray-600'
          )}>
            男
          </span>
        </button>
      </div>
    </div>
  );
}
