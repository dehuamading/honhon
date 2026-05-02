'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 处理登录提交
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 前端校验
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ username, password });

      if (result.success) {
        // 登录成功，跳转到首页
        router.push('/');
      } else {
        setError(result.error || '登录失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* 登录卡片 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            登录账号
          </h1>
          <p className="text-gray-500 mt-2">
            欢迎回到哄哄模拟器
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 用户名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:border-purple-400',
                'placeholder:text-gray-400',
                'bg-white border-gray-200'
              )}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:border-purple-400',
                'placeholder:text-gray-400',
                'bg-white border-gray-200'
              )}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg',
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            还没有账号？{' '}
            <Link
              href="/register"
              className="text-purple-600 font-medium hover:underline"
            >
              立即注册
            </Link>
          </p>
        </div>

        {/* 返回首页 */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
