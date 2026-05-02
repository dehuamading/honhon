'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 处理注册提交
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
    if (!confirmPassword) {
      setError('请确认密码');
      return;
    }

    // 用户名长度
    if (username.trim().length < 3 || username.trim().length > 20) {
      setError('用户名长度需在 3-20 个字符之间');
      return;
    }

    // 密码长度
    if (password.length < 6 || password.length > 50) {
      setError('密码长度需在 6-50 个字符之间');
      return;
    }

    // 密码确认
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ username, password });

      if (result.success) {
        // 注册成功，跳转到首页
        router.push('/');
      } else {
        setError(result.error || '注册失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* 注册卡片 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            创建账号
          </h1>
          <p className="text-gray-500 mt-2">
            加入哄哄模拟器，开始你的挑战
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* 注册表单 */}
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
              placeholder="3-20个字符，可使用中文、字母、数字、下划线"
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
              placeholder="6-50个字符"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:border-purple-400',
                'placeholder:text-gray-400',
                'bg-white border-gray-200'
              )}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:border-purple-400',
                'placeholder:text-gray-400',
                'bg-white border-gray-200'
              )}
              disabled={isLoading}
              autoComplete="new-password"
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
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            已有账号？{' '}
            <Link
              href="/login"
              className="text-purple-600 font-medium hover:underline"
            >
              立即登录
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
