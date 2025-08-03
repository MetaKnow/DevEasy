// 错误的导入方式
// const Dashboard = require('../models/Dashboard');

// 正确的导入方式
const { Dashboard } = require('../models');

// 增加创建新计划的接口
router.post('/task_circle', async (req, res) => {
  try {
    const { year, month, phase } = req.body;
    // 这里添加创建新计划的逻辑
    res.status(201).json({ message: '计划创建成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;