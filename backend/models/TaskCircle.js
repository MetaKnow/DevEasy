'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaskCircle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 定义与Task模型的关联
      TaskCircle.hasMany(models.Task, {
        foreignKey: 'task_circle_id',
        as: 'tasks'
      });

      // 定义与Dashboard模型的关联
      TaskCircle.hasMany(models.dashboard, {
        foreignKey: 'task_circle_id',
        as: 'steps'
      });
    }
  }
  TaskCircle.init({
    year: DataTypes.INTEGER,
    month: DataTypes.INTEGER,
    phase: DataTypes.STRING,
    start_date: { type: DataTypes.DATE, allowNull: true },
    end_date: { type: DataTypes.DATE, allowNull: true },
    total_task: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    total_step: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    complete_task: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    complete_step: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    late_task: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    late_step: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    not_start_step: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    going_step: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    complete_percent: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0.0 },
    late_percent: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0.0 }
  }, {
    sequelize,
    modelName: 'TaskCircle',
    tableName: 'task_circle' // 添加这行指定表名
  });
  return TaskCircle;
};