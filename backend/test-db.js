const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: console.log
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功!');
    const [results] = await sequelize.query('SELECT 1+1 AS result');
    console.log('简单查询结果:', results);
  } catch (error) {
    console.error('连接失败:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();