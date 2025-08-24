// 1. 导入必要的模块
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const db = require('./models');

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

// 自动数据库迁移函数
async function runMigrations() {
  return new Promise((resolve, reject) => {
    console.log('检查数据库迁移...');
    
    const migrationCommand = 'npx sequelize-cli db:migrate';
    
    exec(migrationCommand, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        // 检查是否是重复字段错误，如果是则继续启动
        const errorMessage = error.message || '';
        if (errorMessage.includes('Duplicate column name') || 
            errorMessage.includes('duplicate key') ||
            errorMessage.includes('already exists')) {
          console.warn('检测到重复字段错误，可能是数据库已经是最新状态:', errorMessage);
          console.log('跳过迁移错误，继续启动服务器...');
          resolve('迁移跳过 - 数据库可能已是最新状态');
          return;
        }
        
        console.error('数据库迁移失败:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn('迁移警告:', stderr);
      }
      
      console.log('数据库迁移完成:', stdout);
      resolve(stdout);
    });
  });
}

// 启动服务器前的初始化函数
async function initializeServer() {
  try {
    // 1. 测试数据库连接
    console.log('测试数据库连接...');
    await db.sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 2. 执行数据库迁移
    await runMigrations();
    
    // 3. 启动服务器
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`服务器已启动，端口: ${PORT}`);
      console.log('数据库已同步，服务器准备就绪');
    });
    
  } catch (error) {
    console.error('服务器初始化失败:', error);
    process.exit(1);
  }
}

// 7. 启动服务器
initializeServer();