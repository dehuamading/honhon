/**
 * 场景切换测试脚本
 * 测试场景1 → 场景2 → 场景1 的回复差异
 */

const API_URL = 'http://localhost:3000/api/chat';

async function testScenario(scenarioName, scenarioId, testRound = 1) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`【测试场景】${scenarioName}`);
  console.log(`${'='.repeat(50)}`);

  const messages = testRound === 1
    ? []
    : [
        { role: 'user', content: '我最近工作好累...' },
        { role: 'assistant', content: '（心疼地摸摸头）辛苦啦宝贝，哪里累呀？' },
        { role: 'user', content: '项目压力很大，每天加班到很晚' },
        { role: 'assistant', content: '（撅嘴）那你也要注意身体呀！不能光顾着工作...' }
      ];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender: 'female',
        scenario: scenarioId,
        messages: messages,
        affection: 50,
        step: testRound,
        isGameOver: false,
        won: false,
      }),
    });

    const data = await response.json();

    if (data.error && !data.partnerMessage) {
      console.log('❌ 失败:', data.message || data.error);
      return null;
    }

    console.log('📝 回复:', data.partnerMessage);
    console.log('📊 好感度变化:');
    data.options?.forEach(opt => {
      console.log(`   ${opt.content}: ${opt.score > 0 ? '+' : ''}${opt.score}`);
    });

    return data.partnerMessage;
  } catch (error) {
    console.log('❌ 异常:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('========================================');
  console.log('  场景切换测试');
  console.log('  验证不同场景回复是否差异化');
  console.log('========================================');

  // 场景1: 忘记纪念日 - 第一次
  const r1 = await testScenario('忘记纪念日 (第1次)', 'anniversary', 1);

  // 场景2: 深夜不回消息
  const r2 = await testScenario('深夜不回消息', 'late-night', 1);

  // 场景1: 忘记纪念日 - 第二次（回到场景1）
  const r3 = await testScenario('忘记纪念日 (第2次-回到此场景)', 'anniversary', 1);

  // 场景3: 发现暧昧聊天
  const r4 = await testScenario('发现暧昧聊天', 'flirty-chat', 1);

  // 场景2: 深夜不回消息 - 第二次
  const r5 = await testScenario('深夜不回消息 (第2次)', 'late-night', 1);

  console.log('\n========================================');
  console.log('  测试结果汇总');
  console.log('========================================');
  console.log(`场景1-1: ${r1?.substring(0, 40)}...`);
  console.log(`场景2-1: ${r2?.substring(0, 40)}...`);
  console.log(`场景1-2: ${r3?.substring(0, 40)}...`);
  console.log(`场景3-1: ${r4?.substring(0, 40)}...`);
  console.log(`场景2-2: ${r5?.substring(0, 40)}...`);

  // 检查回复是否都不同
  const allReplies = [r1, r2, r3, r4, r5];
  const uniqueReplies = [...new Set(allReplies)];

  console.log(`\n共 ${allReplies.length} 条回复`);
  console.log(`不同回复 ${uniqueReplies.length} 条`);

  if (uniqueReplies.length === allReplies.length) {
    console.log('\n✅ 所有回复都不同，场景隔离成功！');
  } else {
    console.log('\n⚠️ 存在相同回复，可能有缓存问题');
  }
}

runTests();
