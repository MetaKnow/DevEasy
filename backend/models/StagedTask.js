'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StagedTask extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 与暂存步骤的关联
      StagedTask.hasMany(models.StagedDashboard, {
        foreignKey: 'staged_task_id',
        as: 'stagedSteps'
      });
    }
  }

  StagedTask.init({
    original_task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原始任务ID'
    },
    task_circle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '原始所属阶段ID'
    },
    task_name: {
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
    remark: {
      type: DataTypes.TEXT,
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
    staged_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '暂存时间'
    }
  }, {
    sequelize,
    modelName: 'StagedTask',
    tableName: 'staged_task',
    timestamps: true
  });

  return StagedTask;
};