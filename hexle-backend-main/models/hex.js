'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Hex extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Hex.init(
		{
			hex: {
				type: DataTypes.STRING,
				allowNull: false
			},
			date: {
				type: DataTypes.STRING,
				allowNull: false
			}
		},
		{
			sequelize,
			modelName: 'Hex'
		}
	);
	return Hex;
};
