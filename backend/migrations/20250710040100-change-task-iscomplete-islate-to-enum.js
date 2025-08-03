'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('task', 'iscomplete', {
      type: Sequelize.ENUM('是', '否'),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.changeColumn('task', 'islate', {
      type: Sequelize.ENUM('是', '否'),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('task', 'iscomplete', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
    await queryInterface.changeColumn('task', 'islate', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
  }
};