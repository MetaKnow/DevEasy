'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 先检查字段是否已存在
    const [results] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM task LIKE 'iscomplete';"
    );

    if (results.length === 0) {
      await queryInterface.addColumn('task', 'iscomplete', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      });
    }

    const [results2] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM task LIKE 'islate';"
    );

    if (results2.length === 0) {
      await queryInterface.addColumn('task', 'islate', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('task', 'iscomplete');
    await queryInterface.removeColumn('task', 'islate');
  }
};