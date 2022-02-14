import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import RoomDto from "../../../../commonAssets/Room";
import { Room } from "../roomInterface";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class SocketService {
    socket: Socket;
    rooms: Array<Room> = [];
    observableRooms: BehaviorSubject<Room[]> = new BehaviorSubject<Room[]>([]);

    constructor() {
        this.socket = io();
    }

    createRoom(callback?: () => void): void {
        this.socket.emit("createRoom", null, (data: RoomDto) => {
            this.addRoom(data);
        });
    }

    joinRoom(roomID: string, callback: (a: boolean) => void): void {
        this.socket.emit("joinRoom", roomID, (data: RoomDto) => {
            if (data) {
                this.addRoom(data);
            }
            callback(!!data);
        });
    }

    private addRoom(roomDto: RoomDto): void {
        const idRoom = this.rooms.length + 2;
        this.rooms.push({
            messages: roomDto.messages,
            name: "Pokój " + (idRoom - 1),
            roomID: roomDto.id,
        });
        this.observableRooms.next(this.rooms);
    }
}
