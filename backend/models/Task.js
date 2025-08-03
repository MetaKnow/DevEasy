'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 定义与其他模型的关联
      // 例如，与 TaskCircle 模型的关联
      Task.belongsTo(models.TaskCircle, {
        foreignKey: 'task_circle_id',
        as: 'taskCircle'
      });
      
      // 添加与 Dashboard 模型的关联
      Task.hasMany(models.dashboard, {
        foreignKey: 'task_id',
        as: 'steps'
      });
    }
  }

  Task.init({
    task_circle_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    task_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startdate: {
      type: DataTypes.DATEONLY,
      allowNull: true // 修改为允许空值
    },
    enddate: {
      type: DataTypes.DATEONLY,
      allowNull: true // 修改为允许空值
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 新增字段
    iscomplete: {
      type: DataTypes.ENUM('是', '否'),
      allowNull: true
    },
    islate: {
      type: DataTypes.ENUM('是', '否'),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'task', // 确保表名与迁移文件中的一致
    timestamps: true // 启用 createdAt 和 updatedAt 字段
  });

  return Task;
};