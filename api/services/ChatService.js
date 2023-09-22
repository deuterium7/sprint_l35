const Chat = require('../models/Chat');

class ChatService {
	async getAll(room_id = null) {
		try {
			return await Chat.findAll({
				where: {
					// Личные сообщения не должны отображатьсся у других пользователей
					destination: null,
					room_id: room_id,
				},
				order: [['id', 'DESC']]
			});
		} catch (e) {
			throw e;
		}
	}

	async saveMessage(data) {
		try {
			return await Chat.create(data);
		} catch (e) {
			throw e;
		}
	}
}

module.exports = ChatService;