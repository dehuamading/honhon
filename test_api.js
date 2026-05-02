/**
 * 哄哄模拟器 API 测试脚本
 *
 * 使用方法（确保服务器已启动）：
 *   node test_api.js
 *
 * 或直接用 curl：
 *   curl http://localhost:3000/api/chat
 */

const API_URL = 'http://localhost:3000/api/chat';

async function testAPI() {
  console.log('========================================');
  console.log('  哄哄模拟器 API 测试');
  console.log('========================================\n');

  // 测试1: GET 请求（简单测试连接）
  console.log('【测试1】API 连接测试...');
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log('结果:', JSON.stringify(data, null, 2));
    console.log();
  } catch (error) {
    console.log('失败:', error.message);
    console.log('\n请确保开发服务器已启动: pnpm dev');
    return;
  }

  // 测试2: POST 请求（模拟完整对话）
  console.log('\n【测试2】完整对话测试...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: 'female',
        scenario: 'anniversary',
        messages: [
          { role: 'user', content: '丫头，我今天工作好累啊...' }
        ],
        affection: 50,
        step: 1,
        isGameOver: false,
        won: false,
      }),
    });

    const data = await response.json();
    console.log('状态:', response.status);
    console.log('回复:', data.partnerMessage);
    console.log('选项数:', data.options?.length || 0);
    console.log();

    if (data.options) {
      console.log('选项列表:');
      data.options.forEach(opt => {
        console.log(`  ${opt.id}. ${opt.content} (${opt.score > 0 ? '+' : ''}${opt.score})`);
      });
    }

  } catch (error) {
    console.log('失败:', error.message);
  }

  // 测试3: 带上下文的对话
  console.log('\n【测试3】上下文记忆测试...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: 'female',
        scenario: 'anniversary',
        messages: [
          { role: 'user', content: '今天我们约会去吧' },
          { role: 'assistant', content: '（眼睛亮了）真的吗！去哪里呀，我好期待！' },
          { role: 'user', content: '我们去吃火锅吧' },
          { role: 'assistant', content: '（撅嘴）又是火锅呀，上次吃完身上全是味道...不过和你一起去的话也可以啦！' },
          { role: 'user', content: '抱歉，最近确实冷落你了...' },
        ],
        affection: 40,
        step: 3,
        isGameOver: false,
        won: false,
      }),
    });

    const data = await response.json();
    console.log('回复:', data.partnerMessage);
    console.log();

  } catch (error) {
    console.log('失败:', error.message);
  }

  console.log('========================================');
  console.log('  测试完成');
  console.log('========================================');
}

// 运行测试
testAPI();
