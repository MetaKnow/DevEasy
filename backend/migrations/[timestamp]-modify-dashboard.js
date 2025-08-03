'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 删除task_name字段
    await queryInterface.removeColumn('dashboard', 'task_name');
    
    // 重命名task_details为task_step
    await queryInterface.renameColumn('dashboard', 'task_details', 'task_step');
    
    // 添加task_id外键
    await queryInterface.addColumn('dashboard', 'task_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'task',
        key: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作
    await queryInterface.addColumn('dashboard', 'task_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.renameColumn('dashboard', 'task_step', 'task_details');
    
    await queryInterface.removeColumn('dashboard', 'task_id');
  }
};