'use client';

import { Scene, SceneId } from '@/types/game';
import { cn } from '@/lib/utils';

interface SceneSelectorProps {
  value: Scene | null;
  onChange: (scene: Scene) => void;
  scenes: Scene[];
}

// 场景图标映射
const SCENE_EMOJIS: Record<SceneId, string> = {
  anniversary: '💕',
  'late-night': '🌙',
  'flirty-chat': '💬',
  'lost-cat': '🐱',
  'public-joke': '😤',
};

export function SceneSelector({ value, onChange, scenes }: SceneSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        选择场景
      </label>
      <div className="grid grid-cols-1 gap-2">
        {scenes.map((scene) => {
          const isSelected = value?.id === scene.id;
          const emoji = SCENE_EMOJIS[scene.id] || '💭';

          return (
            <button
              key={scene.id}
              onClick={() => onChange(scene)}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all duration-200',
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'font-medium',
                    isSelected ? 'text-purple-700' : 'text-gray-700'
                  )}>
                    {scene.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {scene.description}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-purple-500 flex-shrink-0">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
