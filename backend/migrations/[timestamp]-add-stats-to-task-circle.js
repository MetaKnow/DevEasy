'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_circle', 'total_task', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'total_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'complete_task', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'complete_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'late_task', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'late_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'complete_percent', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'late_percent', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'not_start_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'going_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('task_circle', 'completed_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task_circle', 'total_task');
    await queryInterface.removeColumn('task_circle', 'total_step');
    await queryInterface.removeColumn('task_circle', 'complete_task');
    await queryInterface.removeColumn('task_circle', 'complete_step');
    await queryInterface.removeColumn('task_circle', 'late_task');
    await queryInterface.removeColumn('task_circle', 'late_step');
    await queryInterface.removeColumn('task_circle', 'complete_percent');
    await queryInterface.removeColumn('task_circle', 'late_percent');
    await queryInterface.removeColumn('task_circle', 'not_start_step');
    await queryInterface.removeColumn('task_circle', 'going_step');
    await queryInterface.removeColumn('task_circle', 'completed_step');
  }
};