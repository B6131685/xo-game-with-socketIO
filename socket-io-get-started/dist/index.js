"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
var express_1 = __importDefault(require("express"));
var uuid_1 = require("uuid");
var cors_1 = __importDefault(require("cors"));
var http_1 = __importDefault(require("http"));
require("dotenv/config");
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
var server = http_1.default.createServer(app);
var socketIO = __importStar(require("socket.io"));
var path_1 = __importDefault(require("path"));
var vaiable_1 = require("./vaiable");
var roomHandler_1 = require("./listeners/roomHandler");
var emit_1 = require("./emit");
exports.io = new socketIO.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    },
});
app.get("/createID", function (req, res) {
    var filePath = path_1.default.join(__dirname, "../pages/index.html");
    res.sendFile(filePath);
});
app.get("/createRoom", function (req, res) {
    var roomID = (0, uuid_1.v4)();
    res.json({ room: roomID });
});
app.post("/joinRoom/:id", function (req, res) {
    var listRoom = (0, vaiable_1.getListRoom)();
    var id = req.params.id;
    var roomobj = listRoom.find(function (item) { return item.id === id; });
    if (!roomobj) {
        res.status(404).json({ message: "not found room" });
    }
    if ((roomobj === null || roomobj === void 0 ? void 0 : roomobj.player.length) && (roomobj === null || roomobj === void 0 ? void 0 : roomobj.player.length) === 1) {
        res.json({ room: id });
    }
    else {
        res.status(403).json({ message: "room is full" });
    }
});
app.get("/test", function (req, res) {
    throw new Error("game full");
});
app.get("/listRoom", function (req, res) {
    var listRoom = (0, vaiable_1.getListRoom)();
    res.json({ listRoom: listRoom });
});
exports.io.on("connection", function (socket) {
    console.log("a user(".concat(socket.id, ") connected"));
    exports.io.emit("listRoom", function () {
        var listRoom = (0, vaiable_1.getListRoom)();
        return listRoom;
    });
    (0, roomHandler_1.roomHandler)(exports.io, socket);
    socket.on("disconnecting", function () {
        // console.log(socket.rooms); // the Set contains at least the socket ID
        var listRoom = (0, vaiable_1.getListRoom)();
        var room = Array.from(socket.rooms)[1];
        if (room) {
            socket.leave(room);
            var index = listRoom.findIndex(function (item) { return item.id === room; });
            if (listRoom[index].player.length === 1) {
                var temp = listRoom.filter(function (item) { return item.id !== room; });
                (0, vaiable_1.setListRoom)(temp);
            }
            else {
                var player = listRoom[index].player.filter(function (item) { return item.socketID !== socket.id; });
                var game_leaver = listRoom[index].player.find(function (item) { return item.socketID === socket.id; });
                listRoom[index].player = player;
                var message = "".concat(game_leaver === null || game_leaver === void 0 ? void 0 : game_leaver.user, " leave room");
                (0, emit_1.emit_Room_canPlay)(listRoom[index].id, false, { message: message });
                (0, vaiable_1.setListRoom)(listRoom);
            }
            var newlistRoom = (0, vaiable_1.getListRoom)();
            exports.io.emit("listRoom", { listRoom: newlistRoom });
        }
    });
});
server.listen(5000, function () {
    console.log("listening on *:5000");
});
