var express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const { faker } = require('@faker-js/faker');

const ChatService = require('./services/ChatService');
const chatService = new ChatService();

var webRouter = require('./routes/web');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация таблиц
require('./models/init').init();

app.use('/', webRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONT_DOMAIN },
  auth: { token: process.env.AUTH_TOKEN },
});

io.use((socket, next) => {
  if (socket.handshake.auth.token === process.env.AUTH_TOKEN) return next();

  const err = new Error("not authorized");
  err.data = { content: "Please retry later" };
  next(err);
});

io.on('connection', async (socket) => {
  try {
    const chatHistory = await chatService.getAll();
    socket.emit('general_chat-history', chatHistory);
  } catch (e) {
    console.error(e);
  }

  socket.on('general_chat-new_message', async (message) => {
    try {
      const chatMessage = await chatService.saveMessage({
        author_name: faker.person.fullName(),
        author_email: faker.internet.email(),
        created_at: new Date(),
        message: message,
      });

      io.emit('general_chat-message_is_stored', Object.assign({ connection_id: socket.id }, chatMessage.dataValues));
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('general_chat-check_stats', (arg) => {
    io.emit('general_chat-new_stats', {
      total_connections: io.engine.clientsCount,
    });
  });

  socket.on('room_chat-join', async (arg) => {
    // Получить историю комнаты
    try {
      const room = `room_${arg.room_id}`;
      socket.join(room);

      const chatHistory = await chatService.getAll(arg.room_id);

      socket.emit('room_chat-history', chatHistory);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('room_chat-new_message', async (arg) => {
    try {
      const room = `room_${arg.room_id}`;

      const chatMessage = await chatService.saveMessage({
        author_name: faker.person.fullName(),
        author_email: faker.internet.email(),
        room_id: arg.room_id,
        message: arg.message,
      });

      io.to(room).emit('room_chat-message_is_stored', Object.assign({ connection_id: socket.id }, chatMessage.dataValues));
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('room_chat-check_stats', (arg) => {
    const room = `room_${arg.room_id}`;

    const roomClients = io.sockets.adapter.rooms.get(room);

    io.to(room).emit('room_chat-new_stats', {
      total_connections: io.engine.clientsCount,
      room_connections: roomClients ? roomClients.size : 0,
    });
  });

  socket.on('private_chat-new_message', async (arg) => {
    try {
      const chatMessage = await chatService.saveMessage({
        author_name: faker.person.fullName(),
        author_email: faker.internet.email(),
        destination: arg.connection_id, // TODO: должен быть идентификатором пользователя
        message: arg.message,
      });

      io.to(arg.connection_id).emit('private_chat-message_is_stored', Object.assign({ connection_id: socket.id }, chatMessage.dataValues));
    } catch (e) {
      console.error(e);
    }
  });
});

httpServer.listen(3001);

module.exports = app;
