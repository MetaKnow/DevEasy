// backend/test-path-to-regexp-detail.js
const { parse } = require('path-to-regexp');
const express = require('express');
const app = express();

// 模拟路由注册
function testRouteRegistration() {
  console.log('测试路由注册...');
  try {
    // 模拟app.use的内部工作方式
    const taskCircleRouter = require('./routes/taskCircle');
    console.log('成功导入taskCircle路由');

    const tasksRouter = require('./routes/tasks');
    console.log('成功导入tasks路由');

    const dashboardRouter = require('./routes/dashboard');
    console.log('成功导入dashboard路由');

    console.log('所有路由导入成功');
  } catch (err) {
    console.error('导入路由时出错:', err.message);
    console.error('错误堆栈:', err.stack);
  }
}

// 测试路径解析
function testPathParsing() {
  console.log('\n测试路径解析...');
  const paths = [
    '/task_circle/years',
    '/task_circle/months',
    '/task_circle/phases',
    '/task_circle/check',
    '/task_circle/create',
    '/task_circle/id',
    '/task_circle/delete',
    '/tasks/',
    '/tasks/create',
    '/tasks/:id',
    '/dashboard/',
    '/dashboard/export',
    '/dashboard/create',
    '/dashboard/:id'
  ];

  paths.forEach(path => {
    try {
      const tokens = parse(path);
      console.log(`路径 ${path} 解析成功`);
    } catch (err) {
      console.error(`路径 ${path} 解析失败:`, err.message);
    }
  });
}

// 运行测试
testRouteRegistration();
testPathParsing();