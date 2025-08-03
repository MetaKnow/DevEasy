const express = require('express');
const router = express.Router();
const db = require('../models');
const { Task } = db;
const { updateTaskCircleStats, updateTaskCircleCompleteStats, updateTaskCircleLateStats, updateTaskCircleStepStates, updateTaskCirclePercentages } = require('../services/taskCircleService');

// 获取任务列表
router.get('/', async (req, res) => {
  try {
    const { task_circle_id } = req.query;
    console.log('接收到获取任务列表的请求:', { task_circle_id });
    const tasks = await Task.findAll({
      where: { task_circle_id },
      include: [{
        model: db.dashboard,
        as: 'steps'
      }]
    });
    console.log('查询到的任务数据:', tasks);
    res.json(tasks);
  } catch (err) {
    console.error('查询任务列表出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 创建新任务
router.post('/create', async (req, res) => {
  try {
    const { task_name, task_circle_id } = req.body;
    console.log('接收到创建任务的请求:', { task_name, task_circle_id });
    const newTask = await Task.create({
      task_name,
      task_circle_id
    });

    // 新增：创建任务后更新统计数据
    await updateTaskCircleStats(task_circle_id);
    // 新增：创建任务后更新完成统计数据
    await updateTaskCircleCompleteStats(task_circle_id);
    await updateTaskCircleLateStats(newTask.task_circle_id);
    await updateTaskCircleStepStates(task_circle_id);
    await updateTaskCirclePercentages(task_circle_id); // 添加此行

    res.status(201).json(newTask);
  } catch (err) {
    console.error('创建任务出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 更新任务
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task_name } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: '找不到该任务' });
    }
    
    await task.update({
      task_name
    });
    
    res.json(task);
  } catch (err) {
    console.error('更新任务出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('接收到删除任务的请求:', { id });

    // 先查询该任务是否存在
    const task = await Task.findByPk(id);
    if (!task) {
      console.log('找不到任务:', { id });
      return res.status(404).json({ message: '找不到该任务' });
    }

    // 保存task_circle_id以便后续更新统计
    const taskCircleId = task.task_circle_id;

    // 先删除引用该任务的所有步骤
    console.log('开始删除引用该任务的所有步骤:', { taskId: id });
    await db.dashboard.destroy({
      where: { task_id: id }
    });
    console.log('已删除引用该任务的所有步骤:', { taskId: id });

    // 然后删除任务本身
    console.log('开始删除任务:', { task });
    await task.destroy();
    console.log('任务已成功删除:', { id });

    // 新增：删除任务后更新统计数据
    await updateTaskCircleStats(taskCircleId);
    // 新增：删除任务后更新完成统计数据
    await updateTaskCircleCompleteStats(taskCircleId);
    await updateTaskCircleLateStats(taskCircleId);
    await updateTaskCircleStepStates(taskCircleId);
    await updateTaskCirclePercentages(taskCircleId); // 添加此行

    res.json({ message: '任务及其所有步骤已成功删除' });
  } catch (err) {
    console.error('删除任务出错:', err);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;