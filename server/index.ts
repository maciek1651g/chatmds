import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";
import Room from "../commonAssets/Room";
import MessageDto from "../commonAssets/MessageDto";

const port = process.env["PORT"] || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    /* options */
});

const rooms: Map<string, Room> = new Map<string, Room>();

const createUniqueID = () => {
    let roomID: string;
    do {
        roomID = io.engine.generateId();
    } while (rooms.has(roomID));

    return roomID;
};

const createNewRoom = (roomID: string, messages?: string[]): Room => {
    if (messages && messages.length > 10) messages.length = 10;
    const room: Room = { id: roomID, messages: messages || [] };
    rooms.set(roomID, room);
    return room;
};

const addMessage = (messageDto: MessageDto) => {
    const room = rooms.get(messageDto.roomID);
    if (room) {
        room.messages.push(messageDto.text);
        if (room.messages.length > 10) room.messages.length = 10;
    }
};

app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));

app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

io.on("connection", (socket) => {
    console.log("Połączono");
    console.log(socket.handshake.query.computerID);

    socket.on("createRoom", (message: null, fn) => {
        const roomID: string = createUniqueID();
        const room = createNewRoom(roomID);
        socket.join(roomID);
        fn(room);
    });

    socket.on("joinRoom", (roomID: string, fn) => {
        if (rooms.has(roomID)) {
            socket.join(roomID);
            fn(rooms.get(roomID));
        } else {
            const room = createNewRoom(roomID);
            socket.join(roomID);
            fn(room);
        }
    });

    socket.on("restoreRooms", (roomsDto: Room[], fn) => {
        for (let i = 0; i < roomsDto.length; i++) {
            const room = createNewRoom(roomsDto[i].id, roomsDto[i].messages);
            socket.join(room.id);
        }
        fn(true);
    });

    socket.on("leaveRoom", (roomID: string, fn) => {
        console.log();
        if (rooms.has(roomID)) {
            socket.leave(roomID);
            fn(true);
        } else {
            fn(false);
        }
    });

    socket.on("sendMessage", (messageDto: MessageDto, fn) => {
        addMessage(messageDto);
        socket.broadcast.to(messageDto.roomID).emit("newMessage", messageDto);
        fn();
    });
});

io.of("/").adapter.on("leave-room", (roomID: string, id: string) => {
    console.log(`socket ${id} has left room ${roomID}`);

    const room = rooms.get(roomID);
    if (room) {
        io.to(roomID).emit("someoneLeaveRoom");
    }
});

io.of("/").adapter.on("delete-room", (roomID: string) => {
    console.log(`room ${roomID} was deleted`);
    if (rooms.has(roomID)) {
        rooms.delete(roomID);
    }
});

httpServer.listen(port, function () {
    console.log("listening on *:" + port);
});
