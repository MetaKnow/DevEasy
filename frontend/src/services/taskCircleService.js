// 创建taskCircle服务
//const fetch = require('node-fetch');

// 基础URL
const BASE_URL = 'http://localhost:5000';

// 获取年份列表
export const getYears = async () => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/years`);
    const data = await response.json();
    // 确保返回的是一个数组
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取年份列表失败:', error);
    return [];
  }
};

// 根据年份获取月份列表
export const getMonthsByYear = async (year) => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/months?year=${year}`);
    const data = await response.json();
    // 确保返回的是一个数组
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取月份列表失败:', error);
    return [];
  }
};

// 根据年份和月份获取阶段列表
export const getPhasesByYearAndMonth = async (year, month) => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/phases?year=${year}&month=${month}`);
    const data = await response.json();
    // 确保返回的是一个数组
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取阶段列表失败:', error);
    return [];
  }
};

// 检查年月阶段是否存在
export const checkYearMonthPhaseExists = async (year, month, phase) => {
  try {
    console.log('发送检查请求:', `${BASE_URL}/task_circle/check?year=${year}&month=${month}&phase=${phase}`);
    const response = await fetch(`${BASE_URL}/task_circle/check?year=${year}&month=${month}&phase=${phase}`);
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    const data = await response.json();
    console.log('检查响应数据:', data);
    return data;
  } catch (error) {
    console.error('检查年月阶段失败:', error);
    // 发生错误时返回true，表示数据存在，防止误启用添加计划按钮
    return true;
  }
};

// 创建新的task_circle数据
export const createTaskCircle = async (year, month, phase) => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // 确保有这个请求头
      },
      body: JSON.stringify({
        year,
        month,
        phase
      })
    });
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('创建task_circle数据失败:', error);
    throw error;
  }
};

// 删除计划及其所有任务和步骤
export const deleteTaskCircle = async (year, month, phase) => {
  try {
    const response = await fetch(`${BASE_URL}/task_circle/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year,
        month,
        phase
      })
    });
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('删除计划失败:', error);
    throw error;
  }
};