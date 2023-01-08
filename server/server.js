const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require("socket.io");
// const {CURRENT_PLAYERS_EVENT, NEW_PLAYER_EVENT, PLAYER_MOVEMENT_EVENT, PLAYER_MOVED_EVENT} = require("./../src/const");
const io = new Server(server);

const CURRENT_PLAYERS_EVENT = 'currentPlayers';
const NEW_PLAYER_EVENT = 'newPlayer';
const PLAYER_MOVEMENT_EVENT = 'playerMovement';
const PLAYER_MOVED_EVENT = 'playerMoved';
const STAR_LOCATION_EVENT = 'starLocation';
const SCORE_UPDATE_EVENT = 'scoreUpdate';
const STAR_COLLECTED_EVENT = 'starCollected';
const LEAVE_PLAYER = 'leavePlayer';

app.use(express.static(__dirname + './../dist'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + './../dist/index.html');
});

let players = {};
let star = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50
};
let scores = {
    blue: 0,
    red: 0
};

io.on('connection', function (socket) {
    console.log('подключился пользователь: ' + socket.id);

    // создание нового игрока и добавление го в объект players
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue'
    };

    // отправляем объект players новому игроку
    socket.emit(CURRENT_PLAYERS_EVENT, players);
    // обновляем всем другим игрокам информацию о новом игроке
    socket.broadcast.emit(NEW_PLAYER_EVENT, players[socket.id]);

    socket.on('disconnect', function () {
        // удаляем игрока из нашего объекта players
        delete players[socket.id];
        // отправляем сообщение всем игрокам, чтобы удалить этого игрока
        io.emit(LEAVE_PLAYER, socket.id);
    });

    // когда игроки движутся, то обновляем данные по ним
    socket.on(PLAYER_MOVEMENT_EVENT, function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // отправляем общее сообщение всем игрокам о перемещении игрока
        socket.broadcast.emit(PLAYER_MOVED_EVENT, players[socket.id]);
    });

    socket.on(STAR_COLLECTED_EVENT, function () {
        if (players[socket.id].team === 'red') {
            scores.red += 10;
        } else {
            scores.blue += 10;
        }
        star.x = Math.floor(Math.random() * 700) + 50;
        star.y = Math.floor(Math.random() * 500) + 50;
        io.emit(STAR_LOCATION_EVENT, star);
        io.emit(SCORE_UPDATE_EVENT, scores);
    });

    // отправляем объект star новому игроку
    socket.emit(STAR_LOCATION_EVENT, star);
    // отправляем текущий счет
    socket.emit(SCORE_UPDATE_EVENT, scores);
});

server.listen(8081, function () {
    console.log(`Прослушиваем ${server.address().port}`);
});