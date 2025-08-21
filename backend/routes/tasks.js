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

// 移动任务到其他年月阶段
router.post('/move', async (req, res) => {
  try {
    const { task_id, target_year, target_month, target_phase } = req.body;
    console.log('接收到移动任务的请求:', { task_id, target_year, target_month, target_phase });

    // 首先查找目标task_circle_id
    const targetTaskCircle = await db.TaskCircle.findOne({
      where: {
        year: target_year,
        month: target_month,
        phase: target_phase
      }
    });

    if (!targetTaskCircle) {
      return res.status(404).json({ message: '目标年月阶段不存在' });
    }

    // 查找要移动的任务
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: '找不到要移动的任务' });
    }

    const oldTaskCircleId = task.task_circle_id;
    const newTaskCircleId = targetTaskCircle.id;

    // 更新任务的task_circle_id
    await task.update({ task_circle_id: newTaskCircleId });

    // 更新该任务下所有步骤的task_circle_id
    await db.dashboard.update(
      { task_circle_id: newTaskCircleId },
      { where: { task_id: task_id } }
    );

    // 更新原阶段和目标阶段的统计数据
    await updateTaskCircleStats(oldTaskCircleId);
    await updateTaskCircleCompleteStats(oldTaskCircleId);
    await updateTaskCircleLateStats(oldTaskCircleId);
    await updateTaskCircleStepStates(oldTaskCircleId);
    await updateTaskCirclePercentages(oldTaskCircleId);

    await updateTaskCircleStats(newTaskCircleId);
    await updateTaskCircleCompleteStats(newTaskCircleId);
    await updateTaskCircleLateStats(newTaskCircleId);
    await updateTaskCircleStepStates(newTaskCircleId);
    await updateTaskCirclePercentages(newTaskCircleId);

    console.log('任务移动成功:', { task_id, from: oldTaskCircleId, to: newTaskCircleId });
    res.json({ 
      message: '任务移动成功', 
      task_id, 
      old_task_circle_id: oldTaskCircleId, 
      new_task_circle_id: newTaskCircleId 
    });
  } catch (err) {
    console.error('移动任务出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 暂存任务到暂存区
router.post('/stage', async (req, res) => {
  try {
    const { task_id } = req.body;
    console.log('接收到暂存任务的请求:', { task_id });

    // 查找要暂存的任务
    const task = await Task.findByPk(task_id, {
      include: [{
        model: db.dashboard,
        as: 'steps'
      }]
    });

    if (!task) {
      return res.status(404).json({ message: '找不到要暂存的任务' });
    }

    // 创建暂存任务
    const stagedTask = await db.StagedTask.create({
      original_task_id: task.id,
      task_circle_id: task.task_circle_id,
      task_name: task.task_name,
      startdate: task.startdate,
      enddate: task.enddate,
      remark: task.remark,
      iscomplete: task.iscomplete,
      islate: task.islate,
      staged_at: new Date()
    });

    // 暂存所有相关步骤
    if (task.steps && task.steps.length > 0) {
      const stagedSteps = task.steps.map(step => ({
        original_step_id: step.id,
        staged_task_id: stagedTask.id,
        task_circle_id: step.task_circle_id,
        task_step: step.task_step,
        startdate: step.startdate,
        enddate: step.enddate,
        responsibility: step.responsibility,
        taskstate: step.taskstate,
        iscomplete: step.iscomplete,
        islate: step.islate,
        priority: step.priority,
        remark: step.remark,
        staged_at: new Date()
      }));
      
      await db.StagedDashboard.bulkCreate(stagedSteps);
    }

    // 删除原始任务和步骤
    const oldTaskCircleId = task.task_circle_id;
    
    // 删除原始步骤
    await db.dashboard.destroy({
      where: { task_id: task_id }
    });
    
    // 删除原始任务
    await task.destroy();

    // 更新原阶段的统计数据
    await updateTaskCircleStats(oldTaskCircleId);
    await updateTaskCircleCompleteStats(oldTaskCircleId);
    await updateTaskCircleLateStats(oldTaskCircleId);
    await updateTaskCircleStepStates(oldTaskCircleId);
    await updateTaskCirclePercentages(oldTaskCircleId);

    console.log('任务暂存成功:', { task_id, staged_task_id: stagedTask.id });
    res.json({ 
      message: '任务暂存成功', 
      task_id, 
      staged_task_id: stagedTask.id 
    });
  } catch (err) {
    console.error('暂存任务出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 获取暂存区数据
router.get('/staged', async (req, res) => {
  try {
    console.log('接收到获取暂存数据的请求');

    // 获取所有暂存任务及其步骤
    const stagedTasks = await db.StagedTask.findAll({
      include: [{
        model: db.StagedDashboard,
        as: 'stagedSteps'
      }],
      order: [['staged_at', 'DESC']]
    });

    console.log('查询到的暂存数据:', stagedTasks.length, '个任务');
    res.json(stagedTasks);
  } catch (err) {
    console.error('获取暂存数据出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 删除暂存任务
router.delete('/staged/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('接收到删除暂存任务的请求:', { id });

    // 查找暂存任务
    const stagedTask = await db.StagedTask.findByPk(id);
    if (!stagedTask) {
      return res.status(404).json({ message: '找不到该暂存任务' });
    }

    // 删除相关的暂存步骤
    await db.StagedDashboard.destroy({
      where: { staged_task_id: id }
    });

    // 删除暂存任务
    await stagedTask.destroy();

    console.log('暂存任务删除成功:', { id });
    res.json({ message: '暂存任务删除成功' });
  } catch (err) {
    console.error('删除暂存任务出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 从暂存区恢复任务到指定阶段
router.post('/staged/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const { target_year, target_month, target_phase } = req.body;
    console.log('接收到恢复暂存任务的请求:', { id, target_year, target_month, target_phase });

    // 查找目标task_circle_id
    const targetTaskCircle = await db.TaskCircle.findOne({
      where: {
        year: target_year,
        month: target_month,
        phase: target_phase
      }
    });

    if (!targetTaskCircle) {
      return res.status(404).json({ message: '目标年月阶段不存在' });
    }

    // 查找暂存任务及其步骤
    const stagedTask = await db.StagedTask.findByPk(id, {
      include: [{
        model: db.StagedDashboard,
        as: 'stagedSteps'
      }]
    });

    if (!stagedTask) {
      return res.status(404).json({ message: '找不到该暂存任务' });
    }

    // 创建新任务
    const newTask = await Task.create({
      task_circle_id: targetTaskCircle.id,
      task_name: stagedTask.task_name,
      startdate: stagedTask.startdate,
      enddate: stagedTask.enddate,
      remark: stagedTask.remark,
      iscomplete: stagedTask.iscomplete,
      islate: stagedTask.islate
    });

    // 恢复所有步骤
    if (stagedTask.stagedSteps && stagedTask.stagedSteps.length > 0) {
      const newSteps = stagedTask.stagedSteps.map(step => ({
        task_id: newTask.id,
        task_circle_id: targetTaskCircle.id,
        task_step: step.task_step,
        startdate: step.startdate,
        enddate: step.enddate,
        responsibility: step.responsibility,
        taskstate: step.taskstate,
        iscomplete: step.iscomplete,
        islate: step.islate,
        priority: step.priority,
        remark: step.remark
      }));
      
      await db.dashboard.bulkCreate(newSteps);
    }

    // 删除暂存数据
    await db.StagedDashboard.destroy({
      where: { staged_task_id: id }
    });
    await stagedTask.destroy();

    // 更新目标阶段的统计数据
    await updateTaskCircleStats(targetTaskCircle.id);
    await updateTaskCircleCompleteStats(targetTaskCircle.id);
    await updateTaskCircleLateStats(targetTaskCircle.id);
    await updateTaskCircleStepStates(targetTaskCircle.id);
    await updateTaskCirclePercentages(targetTaskCircle.id);

    console.log('任务恢复成功:', { id, new_task_id: newTask.id, target_task_circle_id: targetTaskCircle.id });
    res.json({ 
      message: '任务恢复成功', 
      task_id: newTask.id, 
      target_task_circle_id: targetTaskCircle.id 
    });
  } catch (err) {
    console.error('恢复任务出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 删除暂存步骤
router.delete('/staged/step/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('接收到删除暂存步骤的请求:', { id });

    // 查找暂存步骤
    const stagedStep = await db.StagedDashboard.findByPk(id);
    if (!stagedStep) {
      return res.status(404).json({ message: '找不到该暂存步骤' });
    }

    // 删除暂存步骤
    await stagedStep.destroy();

    console.log('暂存步骤删除成功:', { id });
    res.json({ message: '暂存步骤删除成功' });
  } catch (err) {
    console.error('删除暂存步骤出错:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;