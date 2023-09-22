const { io } = require("socket.io-client");
export const socket = io(process.env.VUE_APP_SOCKET_DOMAIN, {
	auth: {
		token: process.env.VUE_APP_SOCKET_AUTH_TOKEN,
	}
});

socket.on('connect', () => {
	console.log(`Connect SocketId: ${socket.id}`);
});

socket.on('disconnect', (reason) => {
	console.log('Socket is disconnected');
	console.log(reason);
});
