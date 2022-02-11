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
app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));
app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});
io.on("connection", function (socket) {
    console.log("Połączono");
    socket.on("createRoom", function (name, fn) {
        socket.join(io.engine.generateId());
        console.log(name);
        fn("asd");
    });
});
httpServer.listen(port, function () {
    console.log("listening on *:" + port);
});
