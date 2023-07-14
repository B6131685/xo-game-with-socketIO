"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit_Room_whoTurn = exports.emit_Room_canPlay = void 0;
var index_1 = require("../index");
function emit_Room_canPlay(roomID, canplay, issue) {
    index_1.io.to(roomID).emit("canplay", {
        canplay: canplay,
        issue: issue
    });
}
exports.emit_Room_canPlay = emit_Room_canPlay;
function emit_Room_whoTurn(roomID, socketID, user) {
    index_1.io.to(roomID).emit("who turn", {
        id: socketID,
        user: user
    });
}
exports.emit_Room_whoTurn = emit_Room_whoTurn;
