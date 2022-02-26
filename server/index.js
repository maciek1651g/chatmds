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
    if (messages && messages.length > 10)
        messages.length = 10;
    var room = { id: roomID, messages: messages || [] };
    rooms.set(roomID, room);
    return room;
};
var addMessage = function (messageDto) {
    var room = rooms.get(messageDto.roomID);
    if (room) {
        room.messages.push(messageDto);
        if (room.messages.length > 10)
            room.messages.length = 10;
    }
    else {
        console.log("room does not exist");
    }
};
app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));
app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});
io.on("connection", function (socket) {
    console.log("Połączono");
    socket.data.computerID = socket.handshake.query.computerID;
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
        var roomsToSendBack = new Map();
        roomsDto = new Map(Object.entries(roomsDto));
        roomsDto.forEach(function (room) {
            if (rooms.has(room.id)) {
                // @ts-ignore
                roomsToSendBack.set(room.id, rooms.get(room.id));
            }
            else {
                var newRoom = createNewRoom(room.id, room.messages);
                roomsToSendBack.set(room.id, newRoom);
            }
            socket.join(room.id);
        });
        fn(Object.fromEntries(roomsToSendBack));
    });
    socket.on("leaveRoom", function (roomID, fn) {
        if (rooms.has(roomID)) {
            socket.leave(roomID);
            fn(true);
        }
        else {
            fn(false);
        }
    });
    socket.on("sendMessage", function (messageDto, fn) {
        addMessage(messageDto);
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
