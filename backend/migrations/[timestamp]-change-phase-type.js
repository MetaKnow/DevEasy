'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('task_circle', 'phase', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('task_circle', 'phase', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};