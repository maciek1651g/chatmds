import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";
var port = process.env["PORT"] || 3000;
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var httpServer = createServer(app);
var io = new Server(httpServer, {
/* options */
});
var rooms = new Map();
var createUniqueID = function () {
    var roomID;
    do {
        roomID = io.engine.generateId();
    } while (rooms.has(roomID));
    return roomID;
};
var createNewRoom = function (roomID, messages) {
    var room = { id: roomID, messages: messages || [] };
    rooms.set(roomID, room);
    return room;
};
app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));
app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});
io.on("connection", function (socket) {
    console.log("Połączono");
    socket.on("createRoom", function (message, fn) {
        var roomID = createUniqueID();
        var room = createNewRoom(roomID);
        socket.join(roomID);
        fn(room);
    });
    socket.on("joinRoom", function (roomID, fn) {
        if (rooms.has(roomID)) {
            socket.join(roomID);
            fn(rooms.get(roomID));
        }
        else {
            var room = createNewRoom(roomID);
            socket.join(roomID);
            fn(room);
        }
    });
    socket.on("restoreRooms", function (roomsDto, fn) {
        for (var i = 0; i < roomsDto.length; i++) {
            var room = createNewRoom(roomsDto[i].id, roomsDto[i].messages);
            socket.join(room.id);
        }
        fn(true);
    });
    socket.on("leaveRoom", function (roomID, fn) {
        console.log();
        if (rooms.has(roomID)) {
            socket.leave(roomID);
            fn(true);
        }
        else {
            fn(false);
        }
    });
    socket.on("sendMessage", function (messageDto, fn) {
        var _a;
        (_a = rooms.get(messageDto.roomID)) === null || _a === void 0 ? void 0 : _a.messages.push(messageDto.text);
        socket.broadcast.to(messageDto.roomID).emit("newMessage", messageDto);
        fn();
    });
});
io.of("/").adapter.on("leave-room", function (roomID, id) {
    console.log("socket ".concat(id, " has left room ").concat(roomID));
    var room = rooms.get(roomID);
    if (room) {
        io.to(roomID).emit("someoneLeaveRoom");
    }
});
io.of("/").adapter.on("delete-room", function (roomID) {
    console.log("room ".concat(roomID, " was deleted"));
    if (rooms.has(roomID)) {
        rooms.delete(roomID);
    }
});
httpServer.listen(port, function () {
    console.log("listening on *:" + port);
});
