const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Dashboard extends Model {
    static init(sequelize) {
      super.init({
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        task_step: {
          type: DataTypes.STRING,
          allowNull: true
        },
        startdate: {
          type: DataTypes.DATE,
          allowNull: true
        },
        enddate: {
          type: DataTypes.DATE,
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
        task_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'task',
            key: 'id'
          }
        },
        task_circle_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'task_circle',
            key: 'id'
          }
        }
      }, {
        sequelize,
        timestamps: true, // 启用时间戳
        underscored: false, // 禁用下划线命名转换
        freezeTableName: true,
        modelName: 'dashboard'
      });
    }
    
    static associate(models) {
      // 定义与Task模型的关联
      Dashboard.belongsTo(models.Task, {
        foreignKey: 'task_id',
        as: 'task'
      });
      
      // 定义与TaskCircle模型的关联
      Dashboard.belongsTo(models.TaskCircle, {
        foreignKey: 'task_circle_id',
        as: 'taskCircle'
      });
    }
  }

  Dashboard.init(sequelize);
  return Dashboard;
};