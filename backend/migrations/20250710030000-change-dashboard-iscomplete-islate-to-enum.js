'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('dashboard', 'iscomplete', {
      type: Sequelize.ENUM('是', '否'),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.changeColumn('dashboard', 'islate', {
      type: Sequelize.ENUM('是', '否'),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('dashboard', 'iscomplete', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
    await queryInterface.changeColumn('dashboard', 'islate', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
  }
};