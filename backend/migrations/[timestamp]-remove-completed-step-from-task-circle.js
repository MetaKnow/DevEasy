'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 删除completed_step字段
    await queryInterface.removeColumn('task_circle', 'completed_step');
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚操作：重新添加字段
    await queryInterface.addColumn('task_circle', 'completed_step', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  }
};