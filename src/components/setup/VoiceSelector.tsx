'use client';

import { VoiceType, VoiceConfig, getVoicesByGender } from '@/types/game';
import { Gender } from '@/types/game';
import { cn } from '@/lib/utils';

interface VoiceSelectorProps {
  value: VoiceType | null;
  onChange: (voiceType: VoiceType) => void;
  gender: Gender | null;
}

export function VoiceSelector({ value, onChange, gender }: VoiceSelectorProps) {
  if (!gender) {
    return (
      <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-gray-500">
        请先选择性别
      </div>
    );
  }

  const voiceOptions = getVoicesByGender(gender);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        选择语音类型
      </label>
      <div className="grid grid-cols-1 gap-2">
        {voiceOptions.map((voice) => {
          const isSelected = value === voice.type;

          return (
            <button
              key={voice.type}
              onClick={() => onChange(voice.type)}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all duration-200',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {voice.type.includes('gentle') ? '🎵' :
                   voice.type.includes('cool') ? '🎤' :
                   voice.type.includes('cute') ? '🎀' :
                   voice.type.includes('deep') ? '🎸' : '🎹'}
                </span>
                <div className="flex-1">
                  <h3 className={cn(
                    'font-medium',
                    isSelected ? 'text-emerald-700' : 'text-gray-700'
                  )}>
                    {voice.label}
                  </h3>
                </div>
                {isSelected && (
                  <span className="text-emerald-500">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
