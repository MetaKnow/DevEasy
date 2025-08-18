// 1. 导入必要的模块
const express = require('express');
const cors = require('cors');

// 2. 创建Express应用实例
const app = express();

// 3. 配置CORS中间件 (必须在其他中间件和路由之前)
app.use(cors({
  origin: 'http://localhost:3000',  // 确保与前端实际域名完全一致
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  optionsSuccessStatus: 200  // 解决某些浏览器对OPTIONS请求的处理问题
}));

// 4. 处理预检请求(OPTIONS)
app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// 5. 配置其他中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. 定义路由
app.get('/', (req, res) => {
  res.send('Development Dashboard API');
});

// 添加这行代码来注册taskCircle路由
app.use('/task_circle', require('./routes/taskCircle'));

// 添加这行代码来注册tasks路由
app.use('/tasks', require('./routes/tasks'));

// 添加这行代码来注册dashboard路由
app.use('/dashboard', require('./routes/dashboard'));

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 7. 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});