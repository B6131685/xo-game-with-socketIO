"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomHandler = void 0;
var vaiable_1 = require("../vaiable");
var emit_1 = require("../emit");
var roomServices_1 = require("../services/roomServices");
var roomHandler = function (io, socket) {
    socket.on("join room", function (data) {
        var listRoom = (0, vaiable_1.getListRoom)();
        var index = (0, roomServices_1.findRoomIndexByRoomID)(data.room);
        if (index !== -1) {
            listRoom[index].player.push({
                user: data.user,
                socketID: socket.id,
                mark: listRoom[index].player[0].mark === "x" ? "o" : "x",
                steps: [],
                state: "ready",
                score: 0
            });
            (0, vaiable_1.setListRoom)(listRoom);
        }
        else {
            listRoom.push({
                id: data.room,
                state: "awaiting",
                player: [{ user: data.user, socketID: socket.id, mark: "o", steps: [], state: "ready", score: 0 }],
                totalStep: 0,
            });
            (0, vaiable_1.setListRoom)(listRoom);
        }
        socket.join(data.room);
        var newlistRoom = (0, vaiable_1.getListRoom)();
        io.emit("listRoom", { listRoom: newlistRoom });
    });
    socket.on("join done", function (_a) {
        var _b, _c;
        var room = _a.room;
        var listRoom = (0, vaiable_1.getListRoom)();
        var index = 0;
        var find = listRoom.find(function (item, i) {
            if (item.id === room) {
                index = i;
                return item;
            }
        });
        io.to(room).emit("players-in-room", find === null || find === void 0 ? void 0 : find.player.map(function (player) { return ({ id: player.socketID, user: player.user, score: player.score }); }));
        var canplay = (find === null || find === void 0 ? void 0 : find.player.length) === 2 && (find === null || find === void 0 ? void 0 : find.player.every(function (person) { return person.state === "ready"; }));
        if (canplay)
            (0, emit_1.emit_Room_canPlay)(room, true, null);
        if (canplay) {
            var randomNum = Math.random();
            if (randomNum < 0.5) {
                (0, emit_1.emit_Room_whoTurn)(room, listRoom[index].player[0].socketID, (_b = listRoom[index]) === null || _b === void 0 ? void 0 : _b.player[0].user);
            }
            else {
                (0, emit_1.emit_Room_whoTurn)(room, listRoom[index].player[1].socketID, (_c = listRoom[index]) === null || _c === void 0 ? void 0 : _c.player[1].user);
            }
            listRoom[index].player[1].state = "playing";
            listRoom[index].player[0].state = "playing";
            (0, vaiable_1.setListRoom)(listRoom);
        }
    });
    // ready for new game
    socket.on("ready", function () {
    });
    socket.on("leave room", function () {
        var listRoom = (0, vaiable_1.getListRoom)();
        var crrRoom = Array.from(socket.rooms)[1];
        var index = (0, roomServices_1.findRoomIndexByRoomID)(crrRoom);
        socket.leave(crrRoom);
        if (index !== -1 && listRoom[index].player.length === 1) {
            var newlistRoom_1 = listRoom.filter(function (item) { return item.id !== crrRoom; });
            (0, vaiable_1.setListRoom)(newlistRoom_1);
        }
        else if (index > -1) {
            var game_leaver_1 = "";
            var temp = listRoom[index].player.filter(function (item) {
                if (item.socketID === socket.id)
                    game_leaver_1 = item.user;
                if (item.socketID !== socket.id) {
                    item.state = "ready";
                    item.steps = [],
                        item.score = 0;
                    return item;
                }
            });
            listRoom[index].player = temp;
            if (listRoom[index].state === "pending") {
                listRoom[index].state = "awaiting";
                var message = "".concat(game_leaver_1, " leave room");
                (0, emit_1.emit_Room_canPlay)(listRoom[index].id, false, { message: message });
                io.emit("reset-game");
            }
            else {
                (0, emit_1.emit_Room_canPlay)(listRoom[index].id, false, null);
            }
            (0, vaiable_1.setListRoom)(listRoom);
        }
        var newlistRoom = (0, vaiable_1.getListRoom)();
        io.emit("listRoom", { listRoom: newlistRoom });
    });
    socket.on("action", function (data) {
        var listRoom = (0, vaiable_1.getListRoom)();
        var roomIndex = null;
        var playerIndex = null;
        var find = listRoom.find(function (room, i) {
            if (room.id === data.room) {
                roomIndex = i;
                return room;
            }
        });
        if (roomIndex !== null) {
            playerIndex = listRoom[roomIndex].player.findIndex(function (item) { return item.socketID === socket.id; });
            listRoom[roomIndex].player[playerIndex].steps.push(data.stepIndex);
            listRoom[roomIndex].totalStep++;
            (0, vaiable_1.setListRoom)(listRoom);
            listRoom[roomIndex].state = "pending";
        }
        var nexUser = null;
        var crrUser = null;
        if (find) {
            for (var _i = 0, _a = find === null || find === void 0 ? void 0 : find.player; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.socketID === socket.id) {
                    crrUser = item;
                }
                else {
                    nexUser = item;
                }
            }
            io.to(find === null || find === void 0 ? void 0 : find.id).emit("room action", __assign(__assign({}, data), { mark: crrUser === null || crrUser === void 0 ? void 0 : crrUser.mark }));
            (0, emit_1.emit_Room_whoTurn)(data.room, nexUser === null || nexUser === void 0 ? void 0 : nexUser.socketID, nexUser === null || nexUser === void 0 ? void 0 : nexUser.user);
        }
        if (roomIndex !== -1 && roomIndex !== null && playerIndex !== -1 && playerIndex !== null) {
            (0, roomServices_1.IsEndGame)(roomIndex, playerIndex, io);
        }
    });
    socket.on("ready-next-round", function (_a) {
        var _b, _c;
        var room = _a.room;
        var listRoom = (0, vaiable_1.getListRoom)();
        var indexRoom = (0, roomServices_1.findRoomIndexByRoomID)(room);
        var arrPlayer = listRoom[indexRoom].player.map(function (player) {
            if (player.socketID === socket.id)
                return __assign(__assign({}, player), { state: "ready" });
            return __assign({}, player);
        });
        if (arrPlayer.every(function (el) { return el.state === "ready"; }) && arrPlayer.length === 2) {
            arrPlayer.forEach(function (item) { return item.state = "playing"; });
            var randomNum = Math.random();
            if (randomNum < 0.5) {
                (0, emit_1.emit_Room_whoTurn)(room, listRoom[indexRoom].player[0].socketID, (_b = listRoom[indexRoom]) === null || _b === void 0 ? void 0 : _b.player[0].user);
            }
            else {
                (0, emit_1.emit_Room_whoTurn)(room, listRoom[indexRoom].player[1].socketID, (_c = listRoom[indexRoom]) === null || _c === void 0 ? void 0 : _c.player[1].user);
            }
            io.emit('start-new-round');
        }
        listRoom[indexRoom].player = arrPlayer;
        (0, vaiable_1.setListRoom)(listRoom);
    });
};
exports.roomHandler = roomHandler;
