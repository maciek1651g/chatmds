import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";
import Room from "../commonAssets/Room";

const port = process.env["PORT"] || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    /* options */
});

const rooms: Map<string, Room> = new Map<string, Room>();

app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));

app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

io.on("connection", (socket) => {
    console.log("Połączono");

    socket.on("createRoom", (message, fn) => {
        let roomID: string;
        do {
            roomID = io.engine.generateId();
        } while (rooms.has(roomID));

        const room: Room = { id: roomID, messages: [] };
        rooms.set(roomID, room);
        socket.join(roomID);
        fn(room);
    });

    socket.on("joinRoom", (roomID, fn) => {
        if (rooms.has(roomID)) {
            socket.join(roomID);
            fn(rooms.get(roomID));
        } else {
            fn(null);
        }
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
