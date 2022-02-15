import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import RoomDto from "../../../../commonAssets/Room";
import MessageDto from "../../../../commonAssets/MessageDto";
import { Room } from "../roomInterface";
import { BehaviorSubject } from "rxjs";


@Injectable({
    providedIn: "root",
})
export class SocketService {
    socket: Socket;
    rooms: Array<Room> = [];
    observableRooms: BehaviorSubject<Room[]> = new BehaviorSubject<Room[]>(
        this.rooms
    );

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

    sendMessage(message: string, roomID: string, callback: () => void): void {
        this.socket.emit("sendMessage", { text: message, roomID: roomID }: MessageDto, () => {
            console.log("Wysłano wiadomość");
            callback();
        });
    }

    private addRoom(roomDto: RoomDto): void {
        const idRoom = this.rooms.length + 2;
        this.rooms.push({
            messages: roomDto.messages.map((message) => ({
                text: message,
                isCurrenUserMessage: false,
            })),
            name: "Pokój " + (idRoom - 1),
            roomID: roomDto.id,
        });
    }
}
