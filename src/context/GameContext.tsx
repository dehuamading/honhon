'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import {
  GameState,
  GameContextType,
  Gender,
  Scene,
  VoiceType,
  Option,
  Message,
  INITIAL_AFFECTION,
  MIN_AFFECTION,
  MAX_AFFECTION,
  WIN_AFFECTION,
  MAX_ROUNDS,
} from '@/types/game';
import { generateId } from '@/lib/utils';

// ============================================
// 初始状态
// ============================================
const initialState: GameState = {
  phase: 'setup',           // 开始阶段
  gender: null,             // 尚未选择性别
  scenario: null,           // 尚未选择场景
  voiceType: null,          // 尚未选择语音
  step: 0,                  // 当前回合
  affection: INITIAL_AFFECTION,  // 初始好感度20
  messages: [],              // 空对话历史
  currentOptions: [],       // 空选项
  gameOver: false,          // 游戏未结束
  result: null,             // 无结果
  isLoading: false,         // 未加载
};

// ============================================
// Action Types
// ============================================
type GameAction =
  | { type: 'SET_GENDER'; payload: Gender }
  | { type: 'SET_SCENARIO'; payload: Scene }
  | { type: 'SET_VOICE_TYPE'; payload: VoiceType }
  | { type: 'START_GAME' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_OPTIONS'; payload: Option[] }
  | { type: 'SELECT_OPTION'; payload: Option }
  | { type: 'END_GAME'; payload: 'won' | 'lost' }
  | { type: 'RESET' };

// ============================================
// Reducer - 确保状态转换正确
// ============================================
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GENDER':
      return { ...state, gender: action.payload };

    case 'SET_SCENARIO':
      return { ...state, scenario: action.payload };

    case 'SET_VOICE_TYPE':
      return { ...state, voiceType: action.payload };

    case 'START_GAME':
      console.log('[GameContext] START_GAME');
      return {
        ...state,
        phase: 'playing',
        step: 1,
        messages: [],
        currentOptions: [],
        gameOver: false,
        result: null,
        isLoading: true,  // 开始时设置为true，表示等待AI回复
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'ADD_MESSAGE':
      console.log('[GameContext] ADD_MESSAGE', { content: action.payload.content.substring(0, 50) });
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'SET_OPTIONS':
      console.log('[GameContext] SET_OPTIONS', { count: action.payload.length });
      return { ...state, currentOptions: action.payload };

    case 'SELECT_OPTION': {
      console.log('[GameContext] SELECT_OPTION', { score: action.payload.score });
      // 应用选项的好感度变化
      const newAffection = Math.max(
        MIN_AFFECTION,
        Math.min(MAX_AFFECTION, state.affection + action.payload.score)
      );

      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: action.payload.content,
      };

      console.log('[GameContext] SELECT_OPTION', {
        oldAffection: state.affection,
        score: action.payload.score,
        newAffection,
        step: state.step,
      });

      // 检查胜利条件：好感度 >= 80
      if (newAffection >= WIN_AFFECTION) {
        console.log('[GameContext] WIN - Affection reached', newAffection);
        return {
          ...state,
          affection: newAffection,
          messages: [...state.messages, userMessage],
          gameOver: true,
          result: 'won',
          phase: 'ended',
          isLoading: false,
          currentOptions: [],  // 清除选项
        };
      }

      // 检查失败条件：好感度 < -50
      if (newAffection < MIN_AFFECTION) {
        console.log('[GameContext] LOSE - Affection too low', newAffection);
        return {
          ...state,
          affection: newAffection,
          messages: [...state.messages, userMessage],
          gameOver: true,
          result: 'lost',
          phase: 'ended',
          isLoading: false,
          currentOptions: [],
        };
      }

      // 继续下一回合
      const nextStep = state.step + 1;

      // 检查回合耗尽
      if (nextStep > MAX_ROUNDS) {
        console.log('[GameContext] ROUNDS_EXCEEDED', { nextStep, max: MAX_ROUNDS });
        return {
          ...state,
          affection: newAffection,
          messages: [...state.messages, userMessage],
          step: nextStep,
          gameOver: true,
          result: newAffection >= WIN_AFFECTION ? 'won' : 'lost',
          phase: 'ended',
          isLoading: false,
          currentOptions: [],
        };
      }

      // 正常继续 - 设置loading状态
      console.log('[GameContext] CONTINUE', { nextStep });
      return {
        ...state,
        affection: newAffection,
        messages: [...state.messages, userMessage],
        step: nextStep,
        isLoading: true,  // 关键：设置为true，等待AI回复
        currentOptions: [],  // 清除当前选项
      };
    }

    case 'END_GAME':
      console.log('[GameContext] END_GAME', { result: action.payload });
      return {
        ...state,
        gameOver: true,
        result: action.payload,
        phase: 'ended',
        isLoading: false,
      };

    case 'RESET':
      console.log('[GameContext] RESET');
      return initialState;

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================
const GameContext = createContext<GameContextType | null>(null);

// ============================================
// Provider
// ============================================
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // 设置性别
  const setGender = useCallback((gender: Gender) => {
    dispatch({ type: 'SET_GENDER', payload: gender });
  }, []);

  // 设置场景
  const setScenario = useCallback((scenario: Scene) => {
    dispatch({ type: 'SET_SCENARIO', payload: scenario });
  }, []);

  // 设置语音类型
  const setVoiceType = useCallback((voiceType: VoiceType) => {
    dispatch({ type: 'SET_VOICE_TYPE', payload: voiceType });
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  // 添加AI消息和选项 - 确保正确设置loading状态
  const addPartnerMessage = useCallback((content: string, options: Option[]) => {
    const message: Message = {
      id: generateId(),
      role: 'partner',
      content,
    };

    console.log('[GameContext] addPartnerMessage', {
      contentLength: content.length,
      optionsCount: options.length,
      currentStep: 0,  // 这只是日志
    });

    dispatch({ type: 'ADD_MESSAGE', payload: message });
    dispatch({ type: 'SET_OPTIONS', payload: options });
    dispatch({ type: 'SET_LOADING', payload: false });  // 关键：AI回复已收到，关闭loading
  }, []);

  // 选择选项
  const selectOption = useCallback((option: Option) => {
    console.log('[GameContext] selectOption called', { id: option.id, content: option.content });
    dispatch({ type: 'SELECT_OPTION', payload: option });
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    console.log('[GameContext] resetGame called');
    dispatch({ type: 'RESET' });
  }, []);

  const value: GameContextType = {
    gameState,
    setGender,
    setScenario,
    setVoiceType,
    startGame,
    selectOption,
    resetGame,
    addPartnerMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ============================================
// Hook
// ============================================
export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
