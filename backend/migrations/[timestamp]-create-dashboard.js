'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dashboard', {
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
      task_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      startdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      enddate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      responsibility: {
        type: Sequelize.STRING,
        allowNull: false
      },
      taskstate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      iscomplete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      islate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      priority: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('dashboard');
  }
};