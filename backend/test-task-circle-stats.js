// 测试脚本，用于验证taskCircleService.js中的函数

// 导入必要的模块
const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

// 创建Sequelize实例
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: console.log
});

// 导入模型
const models = require('./models');

// 导入服务
const taskCircleService = require('./services/taskCircleService');

// 测试函数
async function runTests() {
  try {
    console.log('开始测试...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功!');

    // 测试更新所有TaskCircle的统计字段
    console.log('测试更新所有TaskCircle的统计字段...');
    await taskCircleService.updateAllTaskCircleStats();
    console.log('更新所有TaskCircle的统计字段测试完成');

    // 测试更新特定TaskCircle的统计字段
    console.log('测试更新特定TaskCircle的统计字段...');
    // 获取第一个TaskCircle的ID
    const firstCircle = await models.TaskCircle.findOne();
    if (firstCircle) {
      await taskCircleService.updateTaskCircleStats(firstCircle.id);
      console.log(`更新ID为${firstCircle.id}的TaskCircle的统计字段测试完成`);
    } else {
      console.log('没有找到TaskCircle记录，跳过此测试');
    }

    console.log('测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
    process.exit(0);
  }
}

// 运行测试
runTests();