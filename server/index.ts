import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";
import { Message, MessageDto, ServerRoom } from "../commonAssets/Room";

const port = process.env["PORT"] || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    /* options */
});

const rooms: Map<string, ServerRoom> = new Map<string, ServerRoom>();

const createUniqueID = () => {
    let roomID: string;
    do {
        roomID = io.engine.generateId();
    } while (rooms.has(roomID));

    return roomID;
};

const createNewRoom = (roomID: string, messages?: Message[]): ServerRoom => {
    if (messages && messages.length > 10) messages.length = 10;
    const room: ServerRoom = { id: roomID, messages: messages || [] };
    rooms.set(roomID, room);
    return room;
};

const addMessage = (messageDto: MessageDto) => {
    const room = rooms.get(messageDto.roomID);
    if (room) {
        room.messages.push(messageDto);
        if (room.messages.length > 10) room.messages.length = 10;
    } else {
        console.log("room does not exist");
    }
};

app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));

app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

io.on("connection", (socket) => {
    console.log("Połączono");
    socket.data.computerID = socket.handshake.query.computerID;

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

    socket.on("restoreRooms", (roomsDto: Map<string, ServerRoom>, fn) => {
        const roomsToSendBack = new Map<string, ServerRoom>();
        roomsDto = new Map(Object.entries(roomsDto));
        roomsDto.forEach((room) => {
            if (rooms.has(room.id)) {
                // @ts-ignore
                roomsToSendBack.set(room.id, rooms.get(room.id));
            } else {
                const newRoom = createNewRoom(room.id, room.messages);
                roomsToSendBack.set(room.id, newRoom);
            }
            socket.join(room.id);
        });
        fn(Object.fromEntries(roomsToSendBack));
    });

    socket.on("leaveRoom", (roomID: string, fn) => {
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
