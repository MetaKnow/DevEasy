const express = require('express');
const router = express.Router();
const { TaskCircle, Task, Step } = require('../models');
// 确保正确导入Dashboard模型
const Dashboard = require('../models/Dashboard')(require('../models').sequelize);

// 获取年份列表
router.get('/years', async (req, res) => {
  try {
    console.log('接收到获取年份列表的请求'); // 增加日志
    const years = await TaskCircle.findAll({
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'DESC']]
    });
    console.log('查询到的年份数据:', years); // 增加日志
    res.json(years.map(item => item.year));
  } catch (err) {
    console.error('查询年份列表出错:', err); // 增加日志
    res.status(500).json({ message: err.message });
  }
});

// 根据年份获取月份列表
router.get('/months', async (req, res) => {
  try {
    const { year } = req.query;
    const months = await TaskCircle.findAll({
      attributes: ['month'],
      where: { year },
      group: ['month'],
      order: [['month', 'ASC']]
    });
    res.json(months.map(item => item.month));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 根据年份和月份获取阶段列表
router.get('/phases', async (req, res) => {
  try {
    const { year, month } = req.query;
    const phases = await TaskCircle.findAll({
      attributes: ['phase'],
      where: { year, month },
      group: ['phase'],
      order: [['phase', 'ASC']]
    });
    res.json(phases.map(item => item.phase));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 检查年月阶段是否存在
router.get('/check', async (req, res) => {
  try {
    const { year, month, phase } = req.query;
    console.log('接收到的查询参数:', { year, month, phase }); // 增加日志
    const exists = await TaskCircle.findOne({
      where: { year, month, phase }
    });
    console.log('查询结果:', exists); // 增加日志
    res.json(!!exists);
  } catch (err) {
    console.error('查询出错:', err); // 增加日志
    res.status(500).json({ message: err.message });
  }
});

// 创建新的task_circle数据
router.post('/create', async (req, res) => {
  try {
    console.log('请求头:', req.headers);
    console.log('请求体:', req.body);
    
    // 添加请求验证
    if (!req.body) {
      return res.status(400).json({ message: '请求体不能为空' });
    }
    
    const { year, month, phase } = req.body;
    
    // 验证必要参数
    if (year === undefined || month === undefined || phase === undefined) {
      return res.status(400).json({
        message: '缺少必要参数',
        missing: [
          ...(year === undefined ? ['year'] : []),
          ...(month === undefined ? ['month'] : []),
          ...(phase === undefined ? ['phase'] : [])
        ]
      });
    }
    
    const newTaskCircle = await TaskCircle.create({
      year, month, phase
    });
    res.status(201).json(newTaskCircle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 根据年份、月份和阶段获取task_circle_id
router.get('/id', async (req, res) => {
  try {
    const { year, month, phase } = req.query;
    console.log('接收到获取task_circle_id的请求:', { year, month, phase });
    const taskCircle = await TaskCircle.findOne({
      where: { year, month, phase },
      attributes: ['id']
    });
    console.log('查询结果:', taskCircle);
    if (taskCircle) {
      res.json({ id: taskCircle.id });
    } else {
      res.status(404).json({ message: '未找到对应的task_circle记录' });
    }
  } catch (err) {
    console.error('查询task_circle_id出错:', err);
    res.status(500).json({ message: err.message });
  }
});

// 删除计划及其所有任务和步骤
router.post('/delete', async (req, res) => {
  try {
    console.log('请求体:', req.body);
    
    // 添加请求验证
    if (!req.body) {
      return res.status(400).json({
        message: '请求体不能为空'
      });
    }
    
    const { year, month, phase } = req.body;
    console.log('接收到删除计划的请求:', { year, month, phase });

    // 验证必要参数
    if (year === undefined || month === undefined || phase === undefined) {
      return res.status(400).json({
        message: '缺少必要参数',
        missing: [
          ...(year === undefined ? ['year'] : []),
          ...(month === undefined ? ['month'] : []),
          ...(phase === undefined ? ['phase'] : [])
        ]
      });
    }

    // 首先找到对应的计划
    const taskCircle = await TaskCircle.findOne({
      where: { year, month, phase }
    });

    if (!taskCircle) {
      console.log('未找到计划:', { year, month, phase });
      return res.status(404).json({
        message: '找不到该计划'
      });
    }

    // 获取计划ID
    const taskCircleId = taskCircle.id;
    console.log('找到计划，ID为:', taskCircleId);

    // 先删除dashboard记录
    try {
      // 检查Dashboard是否已定义
      if (!Dashboard) {
        throw new Error('Dashboard模型未定义');
      }

      // 先查询有多少dashboard记录
      const dashboardCount = await Dashboard.count({
        where: { task_circle_id: taskCircleId }
      });
      console.log(`找到${dashboardCount}个dashboard记录`);

      // 然后删除
      const dashboardsDeleted = await Dashboard.destroy({
        where: { task_circle_id: taskCircleId },
        force: true
      });
      console.log(`成功删除${dashboardsDeleted}个dashboard记录`);

      // 再次检查
      const remainingDashboards = await Dashboard.count({
        where: { task_circle_id: taskCircleId }
      });
      console.log(`剩余的dashboard记录数: ${remainingDashboards}`);
    } catch (dashboardError) {
      console.error('删除dashboard记录时出错:', dashboardError);
      return res.status(500).json({
        message: '删除dashboard记录时出错',
        error: dashboardError.message
      });
    }

    // 先删除步骤
    try {
      const stepsDeleted = await Step.destroy({
        where: { task_circle_id: taskCircleId }
      });
      console.log(`成功删除${stepsDeleted}个步骤`);
    } catch (stepError) {
      console.error('删除步骤时出错:', stepError);
      // 不中断流程，继续尝试删除其他部分
    }

    // 再删除任务
    try {
      const tasksDeleted = await Task.destroy({
        where: { task_circle_id: taskCircleId }
      });
      console.log(`成功删除${tasksDeleted}个任务`);
    } catch (taskError) {
      console.error('删除任务时出错:', taskError);
      // 不中断流程，继续尝试删除计划
    }

    // 最后删除计划
    try {
      await taskCircle.destroy({
        force: true
      });
      console.log('成功删除计划:', { year, month, phase });
    } catch (circleError) {
      console.error('删除计划时出错:', circleError);
      return res.status(500).json({
        message: '删除计划时出错',
        error: circleError.message
      });
    }

    // 重新获取年份列表
    const years = await TaskCircle.findAll({
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'DESC']]
    });

    // 构造响应数据
    const responseData = {
      message: '计划已成功删除！相关的任务和步骤也已一并删除。',
      refreshedYears: years.map(item => item.year),
      // 指示前端刷新表格
      refreshTable: true,
      // 指示前端刷新整个页面
      refreshPage: true
    };

    res.json(responseData);
  } catch (err) {
    console.error('删除计划时出错:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// 获取任务圈统计数据
router.get('/stats', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: '缺少task_circle_id参数' });
    }

    const taskCircle = await TaskCircle.findByPk(id, {
      attributes: [
        'total_task', 'total_step', 'complete_task', 'complete_step',
        'late_task', 'late_step', 'not_start_step', 'going_step',
        'complete_percent', 'late_percent'
      ]
    });

    if (!taskCircle) {
      return res.status(404).json({ message: '未找到对应的任务圈记录' });
    }

    res.json(taskCircle);
  } catch (err) {
    console.error('获取统计数据出错:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;