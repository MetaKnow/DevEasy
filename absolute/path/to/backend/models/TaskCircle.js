'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaskCircle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TaskCircle.init({
    year: DataTypes.INTEGER,
    month: DataTypes.INTEGER,
    phase: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TaskCircle',
  });
  return TaskCircle;
};