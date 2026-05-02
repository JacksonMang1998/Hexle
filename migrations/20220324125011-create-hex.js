'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Hexes', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			hex: {
				allowNull: false,
				type: Sequelize.STRING
			},
			date: {
				allowNull: false,
				type: Sequelize.BIGINT
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Hexes');
	}
};
