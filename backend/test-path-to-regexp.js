// backend/test-path-to-regexp.js
const { parse } = require('path-to-regexp');

// 测试项目中使用的路由路径
const pathsToTest = [
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
  '/tasks/:id',
  '/dashboard/',
  '/dashboard/export',
  '/dashboard/create',
  '/dashboard/:id',
  '/dashboard/:id'
];

console.log('开始测试路由路径...');
pathsToTest.forEach(path => {
  try {
    const tokens = parse(path);
    console.log(`路径 ${path} 解析成功:`, tokens);
  } catch (err) {
    console.error(`路径 ${path} 解析失败:`, err.message);
  }
});