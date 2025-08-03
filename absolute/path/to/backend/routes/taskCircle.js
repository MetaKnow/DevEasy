const express = require('express');
const router = express.Router();
const { TaskCircle } = require('../models');

// 获取年份列表
router.get('/years', async (req, res) => {
  try {
    const years = await TaskCircle.findAll({
      attributes: ['year'],
      group: ['year'],
      order: [['year', 'DESC']]
    });
    res.json(years.map(item => item.year));
  } catch (err) {
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
    const exists = await TaskCircle.findOne({
      where: { year, month, phase }
    });
    res.json(!!exists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建新的task_circle数据
router.post('/create', async (req, res) => {
  try {
    const { year, month, phase } = req.body;
    const newTaskCircle = await TaskCircle.create({
      year, month, phase
    });
    res.status(201).json(newTaskCircle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;