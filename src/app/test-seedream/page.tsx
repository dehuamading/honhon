'use client';

import { useState } from 'react';

/**
 * Seedream API 测试页面
 * 用于测试 Doubao-Seedream-5.0-lite 模型的问答功能
 */
export default function TestSeedreamPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [configStatus, setConfigStatus] = useState<'unchecked' | 'ok' | 'error'>('unchecked');

  // 检查配置
  const checkConfig = async () => {
    try {
      const response = await fetch('/api/seedream');
      const data = await response.json();
      setConfigStatus(data.configured ? 'ok' : 'error');
      return data.configured;
    } catch {
      setConfigStatus('error');
      return false;
    }
  };

  // 提交问题
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('请输入问题');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('/api/seedream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (data.success) {
        setAnswer(data.answer);
      } else {
        setError(data.message || '调用失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时检查配置
  useState(() => {
    checkConfig();
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            Doubao-Seedream-5.0-lite 测试
          </h1>
          <p className="text-gray-600">
            火山引擎豆包模型 API 问答测试
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
            接入点: ep-20260426175445-72vqt
          </div>
        </div>

        {/* 配置状态 */}
        {configStatus === 'unchecked' && (
          <div className="text-center py-4 text-gray-500">
            正在检查配置...
          </div>
        )}
        {configStatus === 'ok' && (
          <div className="text-center py-2 mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
              ✓ API 已配置
            </span>
          </div>
        )}
        {configStatus === 'error' && (
          <div className="text-center py-2 mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
              ✗ API 未配置或配置错误
            </span>
          </div>
        )}

        {/* 输入表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            输入你的问题
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：你好，请介绍一下你自己"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
          {error && (
            <div className="mt-2 text-red-500 text-sm">
              错误: {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
          >
            {isLoading ? '正在等待回答...' : '提交问题'}
          </button>
        </form>

        {/* 回答显示 */}
        {answer && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              回答
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
              {answer}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            使用说明
          </h2>
          <div className="text-gray-600 space-y-2 text-sm">
            <p><strong>配置检查：</strong>确保 .env.local 中已正确配置 SEEDREAM_API_KEY 和 SEEDREAM_ENDPOINT_ID</p>
            <p><strong>API 地址：</strong>https://ark.cn-beijing.volces.com/api/v3/chat/completions</p>
            <p><strong>模型接入点：</strong>ep-20260426175445-72vqt</p>
            <p><strong>调用方式：</strong>POST /api/seedream，Body: {"{ question: string }"}</p>
          </div>
        </div>

        {/* 返回链接 */}
        <div className="text-center mt-6">
          <a href="/" className="text-purple-600 hover:underline">
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
