const { db, DataTypes } = require("../db");

const Chat = db.define('Chat', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	room_id: {
		type: DataTypes.INTEGER,
		allowNull: true
	},

	/** Автор сообщения */
	// TODO
	// author_id: {
	// 	type: DataTypes.INTEGER,
	// 	allowNull: true,
	// },
	author_email: {
		type: DataTypes.STRING(255),
		allowNull: true,
	},
	author_name: {
		type: DataTypes.STRING(255),
		allowNull: true,
	},

	/** Адресат сообщения */
	// TODO
	// destination_id: {
	// 	type: DataTypes.INTEGER,
	// 	allowNull: true,
	// },
	destination: {
		type: DataTypes.STRING(255),
		allowNull: true,
	},

	message: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	created_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
		allowNull: true,
	},
	updated_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
		allowNull: true,
	},
}, {
	tableName: 'chat',
	underscored: true,
	timestamps: false,
})

module.exports = Chat;