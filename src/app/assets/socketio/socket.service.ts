import { Injectable, OnInit } from "@angular/core";
import { io, Socket } from "socket.io-client";
import RoomDto from "../../../../commonAssets/Room";

@Injectable({
    providedIn: "root",
})
export class SocketService implements OnInit {
    socket: Socket;

    constructor() {
        this.socket = io();
    }

    ngOnInit(): void {
        console.log("asd");
    }

    createRoom(callback: (a: RoomDto) => void): void {
        this.socket.emit("createRoom", null, (data: RoomDto) => {
            callback(data);
        });
    }
}
