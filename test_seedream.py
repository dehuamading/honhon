#!/usr/bin/env python3
"""
===========================================
Doubao-Seedream-5.0-lite API 测试脚本
===========================================

作者：Claude
日期：2026-04-26
"""

import requests
import json
import sys
from typing import Optional, Dict, Any

# ============================================
# 配置
# ============================================

API_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
API_KEY = "d189b273-8f0a-42e9-b026-db59564333c5"
MODEL_ID = "ep-20260426175445-72vqt"


def call_doubao(messages: list, temperature: float = 0.7) -> Dict[str, Any]:
    """
    调用豆包模型 API
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 2000,
    }

    print(f"[请求信息]")
    print(f"  URL: {API_BASE_URL}/chat/completions")
    print(f"  Model: {MODEL_ID}")
    print(f"  Messages: {len(messages)}")

    try:
        response = requests.post(
            f"{API_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
        )

        print(f"[响应状态码]: {response.status_code}")

        if response.status_code != 200:
            print(f"[错误响应]: {response.text[:500]}")
            return {"error": response.text, "status_code": response.status_code}

        result = response.json()
        return result

    except requests.exceptions.Timeout:
        return {"error": "请求超时"}
    except requests.exceptions.ConnectionError as e:
        return {"error": f"连接失败: {e}"}
    except Exception as e:
        return {"error": str(e)}


def extract_content(response: Dict[str, Any]) -> Optional[str]:
    """提取响应内容"""
    try:
        if "error" in response:
            return None
        choices = response.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
    except:
        pass
    return None


def test_basic():
    """基础测试"""
    print("\n" + "=" * 50)
    print("  基础问答测试")
    print("=" * 50)

    messages = [
        {"role": "user", "content": "你好，请回复'测试成功'"}
    ]

    print("\n发送测试请求...")
    result = call_doubao(messages)

    content = extract_content(result)
    if content:
        print(f"\n✓ 成功! 回答: {content}")
        return True
    else:
        print(f"\n✗ 失败: {result.get('error', '未知错误')}")
        return False


def test_with_system():
    """带系统提示词的测试"""
    print("\n" + "=" * 50)
    print("  带系统提示词的测试")
    print("=" * 50)

    messages = [
        {"role": "system", "content": "你是一个有帮助的AI助手，请用中文回答。"},
        {"role": "user", "content": "什么是人工智能？用一句话回答。"}
    ]

    print("\n发送请求...")
    result = call_doubao(messages)

    content = extract_content(result)
    if content:
        print(f"\n✓ 成功! 回答: {content}")
        return True
    else:
        print(f"\n✗ 失败: {result.get('error', '未知错误')}")
        return False


def test_connection():
    """连接测试"""
    print("\n" + "=" * 50)
    print("  API 连接测试")
    print("=" * 50)

    print(f"\n检查配置:")
    print(f"  API_URL: {API_BASE_URL}")
    print(f"  API_KEY: {API_KEY[:10]}...{API_KEY[-4:]}")
    print(f"  MODEL_ID: {MODEL_ID}")

    # 简单测试
    messages = [{"role": "user", "content": "Hi"}]
    result = call_doubao(messages)

    if result.get("status_code") == 200:
        print("\n✓ API 连接成功!")
        return True
    elif result.get("status_code") == 400:
        print("\n! 收到400错误，可能是:")
        print("  1. 模型接入点ID不正确")
        print("  2. 请求格式问题")
        print(f"  3. 错误详情: {result.get('error', '')[:200]}")
        return False
    elif result.get("status_code") == 401:
        print("\n✗ 认证失败，请检查API密钥")
        return False
    else:
        print(f"\n✗ 连接失败: {result.get('error', '未知错误')}")
        return False


def main():
    print("=" * 50)
    print("  Doubao-Seedream-5.0-lite API 测试")
    print("=" * 50)

    # 先测试连接
    if not test_connection():
        print("\n建议检查:")
        print("  1. API密钥是否正确")
        print("  2. 接入点ID是否存在")
        print("  3. 账户是否有足够配额")
        sys.exit(1)

    # 运行其他测试
    test_basic()
    test_with_system()

    print("\n" + "=" * 50)
    print("  测试完成")
    print("=" * 50)


if __name__ == "__main__":
    main()
