'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建暂存任务表
    await queryInterface.createTable('staged_task', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      original_task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '原始任务ID'
      },
      task_circle_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '原始所属阶段ID'
      },
      task_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startdate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      enddate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      iscomplete: {
        type: Sequelize.ENUM('是', '否'),
        allowNull: true
      },
      islate: {
        type: Sequelize.ENUM('是', '否'),
        allowNull: true
      },
      staged_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: '暂存时间'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 创建暂存步骤表
    await queryInterface.createTable('staged_dashboard', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      original_step_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '原始步骤ID'
      },
      staged_task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staged_task',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      task_circle_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '原始所属阶段ID'
      },
      task_step: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startdate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      enddate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      responsibility: {
        type: Sequelize.STRING,
        allowNull: true
      },
      taskstate: {
        type: Sequelize.STRING,
        allowNull: true
      },
      iscomplete: {
        type: Sequelize.ENUM('是', '否'),
        allowNull: true
      },
      islate: {
        type: Sequelize.ENUM('是', '否'),
        allowNull: true
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: true
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      staged_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: '暂存时间'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('staged_dashboard');
    await queryInterface.dropTable('staged_task');
  }
};