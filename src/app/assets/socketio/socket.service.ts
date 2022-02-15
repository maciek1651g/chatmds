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
        this.socket.on("newMessage", (messageDto: MessageDto) => {
            this.addMessage(messageDto, false);
        });
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

    sendMessage(message: string, roomID: string, callback?: () => void): void {
        const messageDto: MessageDto = { text: message, roomID: roomID };
        this.socket.emit("sendMessage", messageDto, () => {
            this.addMessage(messageDto, true);
            if (callback) {
                callback();
            }
        });
    }

    private addRoom(roomDto: RoomDto): void {
        console.log(roomDto);
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

    private addMessage(messageDto: MessageDto, isCurrentUserMessage: boolean) {
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].roomID === messageDto.roomID) {
                this.rooms[i].messages.push({
                    text: messageDto.text,
                    isCurrenUserMessage: isCurrentUserMessage,
                });
                break;
            }
        }
    }
}
