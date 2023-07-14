"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setListRoom = exports.getListRoom = void 0;
var listRoom = [];
var getListRoom = function () {
    return listRoom !== null && listRoom !== void 0 ? listRoom : [];
};
exports.getListRoom = getListRoom;
var setListRoom = function (arr) {
    listRoom = __spreadArray([], arr, true);
};
exports.setListRoom = setListRoom;
