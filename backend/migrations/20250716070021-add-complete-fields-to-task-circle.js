'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 检查字段是否已存在，避免重复添加
    const [results1] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM task_circle LIKE 'complete_task';"
    );

    if (results1.length === 0) {
      await queryInterface.addColumn('task_circle', 'complete_task', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    }

    const [results2] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM task_circle LIKE 'complete_step';"
    );

    if (results2.length === 0) {
      await queryInterface.addColumn('task_circle', 'complete_step', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 检查字段是否存在再删除
    const [results1] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM task_circle LIKE 'complete_task';"
    );

    if (results1.length > 0) {
      await queryInterface.removeColumn('task_circle', 'complete_task');
    }

    const [results2] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM task_circle LIKE 'complete_step';"
    );

    if (results2.length > 0) {
      await queryInterface.removeColumn('task_circle', 'complete_step');
    }
  }
};