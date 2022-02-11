import { Injectable, OnInit } from "@angular/core";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: "root",
})
export class SocketService implements OnInit {
    socket: Socket;

    constructor() {
        this.socket = io("http://localhost:4200/");
    }

    ngOnInit(): void {
        console.log("asd");
    }

    createRoom(): void {
        console.log("createRoom");
        this.socket.emit("createRoom", null, (data: any) => {
            console.log(data);
        });
    }
}
