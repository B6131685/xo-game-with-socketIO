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
exports.findRoomIndexByRoomID = exports.IsEndGame = void 0;
var vaiable_1 = require("../vaiable");
var WinPattern = [
    {
        ptt: [1, 2, 3],
        type: "row",
    },
    {
        ptt: [4, 5, 6],
        type: "row",
    },
    {
        ptt: [7, 8, 9],
        type: "row",
    },
    {
        ptt: [1, 4, 7],
        type: "col",
    },
    {
        ptt: [2, 5, 8],
        type: "col",
    },
    {
        ptt: [3, 6, 9],
        type: "col",
    },
    {
        ptt: [1, 5, 9],
        type: "left_diagonal",
    },
    {
        ptt: [3, 5, 7],
        type: "right_diagonal",
    },
];
var IsEndGame = function (roomindex, playerindex, io) {
    var listRoom = (0, vaiable_1.getListRoom)();
    var steps = listRoom[roomindex].player[playerindex].steps;
    var resetRoom = false;
    WinPattern.forEach(function (item) {
        if (item.ptt.every(function (num) { return steps.includes(num); })) {
            listRoom[roomindex].player[playerindex].score++;
            resetRoom = true;
            var winner = listRoom[roomindex].player[playerindex];
            io.to(listRoom[roomindex].id).emit("gameEnd", {
                player: { id: winner.socketID, user: winner.user, score: winner.score },
                pattern: item.ptt,
                lineType: item.type,
            });
        }
    });
    if (resetRoom) {
        listRoom[roomindex].totalStep = 0;
        listRoom[roomindex].player = listRoom[roomindex].player.map(function (item) { return (__assign(__assign({}, item), { steps: [], state: "awaiting" })); });
        (0, vaiable_1.setListRoom)(listRoom);
        io.emit('reset-box');
    }
};
exports.IsEndGame = IsEndGame;
var findRoomIndexByRoomID = function (id) {
    var listRoom = (0, vaiable_1.getListRoom)();
    var index = listRoom.findIndex(function (item) { return item.id === id; });
    return index;
};
exports.findRoomIndexByRoomID = findRoomIndexByRoomID;
