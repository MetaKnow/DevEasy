'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StagedDashboard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 与暂存任务的关联
      StagedDashboard.belongsTo(models.StagedTask, {
        foreignKey: 'staged_task_id',
        as: 'stagedTask'
      });
    }
  }

  StagedDashboard.init({
    original_step_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原始步骤ID'
    },
    staged_task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'staged_task',
        key: 'id'
      }
    },
    task_circle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '原始所属阶段ID'
    },
    task_step: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startdate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    enddate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    responsibility: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taskstate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    iscomplete: {
      type: DataTypes.ENUM('是', '否'),
      allowNull: true
    },
    islate: {
      type: DataTypes.ENUM('是', '否'),
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    staged_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '暂存时间'
    }
  }, {
    sequelize,
    modelName: 'StagedDashboard',
    tableName: 'staged_dashboard',
    timestamps: true
  });

  return StagedDashboard;
};