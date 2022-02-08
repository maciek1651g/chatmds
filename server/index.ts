import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";

const port = process.env["PORT"] || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    /* options */
});

app.use(compression());
app.use(express.static("client", { maxAge: 3600000 }));

app.all("*", function (req, res, next) {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

io.on("connection", (socket) => {
    console.log("Połączono");
});

httpServer.listen(port, function () {
    console.log("listening on *:" + port);
});
