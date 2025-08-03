const express = require('express');
const router = express.Router();
const db = require('../models');
const Dashboard = db.dashboard;
const { updateTaskCircleStats, updateTaskCircleCompleteStats, updateTaskCircleLateStats, updateTaskCircleStepStates, updateTaskCirclePercentages } = require('../services/taskCircleService');

// 获取看板数据
router.get('/', async (req, res) => {
  try {
    const { year, month, phase } = req.query;
    const dashboards = await Dashboard.findAll({
      where: { year, month, phase }
    });
    res.json(dashboards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 导出Excel
router.get('/export', async (req, res) => {
  try {
    const { year, month, phase } = req.query;
    // 这里添加Excel导出逻辑
    res.json({ message: 'Excel导出功能待实现' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新步骤
router.post('/create', async (req, res) => {
  try {
    const { task_step, startdate, enddate, responsibility, taskstate, iscomplete, islate, priority, remark, task_id, task_circle_id } = req.body;
    const newDashboard = await Dashboard.create({
      task_step,
      startdate,
      enddate,
      responsibility,
      taskstate,
      iscomplete,
      islate,
      priority,
      remark,
      task_id,
      task_circle_id
    });

    // 新增：创建步骤后更新统计数据
    await updateTaskCircleStats(task_circle_id);

    // 新增：更新所属任务的iscomplete和islate字段
    await updateTaskIsComplete(task_id);
    await updateTaskIsLate(task_id);

    // 新增：创建步骤后更新完成统计数据
    await updateTaskCircleCompleteStats(task_circle_id);
    // 新增：创建步骤后更新逾期统计数据
    await updateTaskCircleLateStats(task_circle_id); 
    // 新增：创建步骤后更新步骤状态统计数据
    await updateTaskCircleStepStates(task_circle_id);
    // 新增：创建步骤后更新完成百分比和逾期百分比
    await updateTaskCirclePercentages(task_circle_id);

    res.status(201).json(newDashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 更新步骤
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task_step, startdate, enddate, responsibility, taskstate, iscomplete, islate, priority, remark } = req.body;
    
    const dashboard = await Dashboard.findByPk(id);
    if (!dashboard) {
      return res.status(404).json({ message: '找不到该步骤' });
    }
    
    // 保存task_id和task_circle_id以便后续更新
    const taskId = dashboard.task_id;
    const taskCircleId = dashboard.task_circle_id;
    
    // 更新步骤信息
    dashboard.task_step = task_step;
    dashboard.startdate = startdate;
    dashboard.enddate = enddate;
    dashboard.responsibility = responsibility;
    dashboard.taskstate = taskstate;
    dashboard.iscomplete = iscomplete;
    dashboard.islate = islate;
    dashboard.priority = priority;
    dashboard.remark = remark;
    
    await dashboard.save();

    // 新增：更新所属任务的iscomplete和islate字段
    await updateTaskIsComplete(taskId);
    await updateTaskIsLate(taskId);

    // 新增：更新步骤后更新完成统计数据
    await updateTaskCircleCompleteStats(taskCircleId);
    // 新增：创建步骤后更新逾期统计数据
    await updateTaskCircleLateStats(taskCircleId); 
    // 新增：创建步骤后更新步骤状态统计数据
    await updateTaskCircleStepStates(taskCircleId);
    // 新增：更新步骤后更新完成百分比和逾期百分比
    await updateTaskCirclePercentages(taskCircleId);

    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 删除步骤
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dashboard = await Dashboard.findByPk(id);
    if (!dashboard) {
      return res.status(404).json({ message: '找不到该步骤' });
    }

    // 保存task_circle_id和task_id以便后续更新
    const taskCircleId = dashboard.task_circle_id;
    const taskId = dashboard.task_id;

    await dashboard.destroy();

    // 新增：删除步骤后更新统计数据
    await updateTaskCircleStats(taskCircleId);
    await updateTaskCircleCompleteStats(taskCircleId);
    await updateTaskCircleLateStats(taskCircleId); // 添加此行

    // 新增：更新所属任务的iscomplete和islate字段
    await updateTaskIsComplete(taskId);
    await updateTaskIsLate(taskId);

    // 新增：删除步骤后更新完成统计数据
    await updateTaskCircleCompleteStats(taskCircleId);
    // 新增：创建步骤后更新逾期统计数据
    await updateTaskCircleLateStats(taskCircleId); 
    // 新增：删除步骤后更新步骤状态统计数据
    await updateTaskCircleStepStates(taskCircleId);
    // 新增：删除步骤后更新完成百分比和逾期百分比
    await updateTaskCirclePercentages(taskCircleId);

    res.json({ message: '步骤删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


// 更新任务的iscomplete字段
const updateTaskIsComplete = async (taskId) => {
  try {
    // 查找任务
    const task = await db.Task.findByPk(taskId);
    if (!task) {
      console.error('找不到任务:', taskId);
      return;
    }

    // 查找该任务的所有步骤
    const steps = await db.dashboard.findAll({
      where: { task_id: taskId }
    });

    // 检查所有步骤是否都已完成
    const allCompleted = steps.every(step => step.iscomplete === '是');

    // 更新任务的iscomplete字段
    await task.update({
      iscomplete: allCompleted ? '是' : '否'
    });

    console.log(`已更新任务 ${taskId} 的iscomplete字段为: ${allCompleted ? '是' : '否'}`);
  } catch (err) {
    console.error('更新任务iscomplete字段出错:', err);
  }
};

// 更新任务的islate字段
const updateTaskIsLate = async (taskId) => {
  try {
    // 查找任务
    const task = await db.Task.findByPk(taskId);
    if (!task) {
      console.error('找不到任务:', taskId);
      return;
    }

    // 查找该任务的所有步骤
    const steps = await db.dashboard.findAll({
      where: { task_id: taskId }
    });

    // 检查是否有任何步骤超期
    const anyLate = steps.some(step => step.islate === '是');

    // 更新任务的islate字段
    await task.update({
      islate: anyLate ? '是' : '否'
    });

    console.log(`已更新任务 ${taskId} 的islate字段为: ${anyLate ? '是' : '否'}`);
  } catch (err) {
    console.error('更新任务islate字段出错:', err);
  }
};