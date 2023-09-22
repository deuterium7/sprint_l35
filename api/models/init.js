const Todo = require('./Todo');
const Chat = require('./Chat');

const init = async () => {
	await Todo.sync({ alter: true });
	await Chat.sync({ alter: true });
}

module.exports = { init, Todo };