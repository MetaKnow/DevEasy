'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      task_circle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'task_circle',
          key: 'id'
        }
      },
      task_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      enddate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('task');
  }
};