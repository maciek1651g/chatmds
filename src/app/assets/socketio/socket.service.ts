import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import RoomDto from "../../../../commonAssets/Room";
import MessageDto from "../../../../commonAssets/MessageDto";
import { Room } from "../roomInterface";
import { BehaviorSubject } from "rxjs";
import { LocalStorageService } from "../localStorage/local-storage.service";

@Injectable({
    providedIn: "root",
})
export class SocketService {
    socket: Socket;
    rooms: Array<Room> = [];
    observableRooms: BehaviorSubject<Room[]> = new BehaviorSubject<Room[]>(
        this.rooms
    );

    constructor(private localStorage: LocalStorageService) {
        this.socket = io();
        this.socket.on("newMessage", (messageDto: MessageDto) => {
            this.addMessage(messageDto, false);
        });

        const data = this.localStorage.getData();
        if (data) {
            this.restoreAllRooms(data);
        }

        window.addEventListener("beforeunload", (e) => {
            this.localStorage.saveData(this.rooms);
        });
    }

    createRoom(callback?: () => void): void {
        this.socket.emit("createRoom", null, (data: RoomDto) => {
            this.addRoom(data);
            if (callback) {
                callback();
            }
        });
    }

    joinRoom(roomID: string, callback?: (a: boolean) => void): void {
        this.socket.emit("joinRoom", roomID, (data: RoomDto) => {
            if (data) {
                this.addRoom(data);
            }
            if (callback) {
                callback(!!data);
            }
        });
    }

    leaveRoom(roomID: string, callback?: (a: boolean) => void): void {
        this.socket.emit("leaveRoom", roomID, (status: boolean) => {
            this.deleteRoom(roomID);
            if (status) {
                if (callback) {
                    callback(true);
                }
            } else {
                if (callback) {
                    callback(false);
                }
            }
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

    private addRoom(roomDto: RoomDto, roomName?: string): void {
        const idRoom = this.rooms.length + 1;
        this.rooms.push({
            messages: roomDto.messages.map((message) => ({
                text: message,
                isCurrenUserMessage: false,
            })),
            name: roomName || "Pokój " + idRoom,
            roomID: roomDto.id,
        });
        this.observableRooms.next(this.rooms);
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

    private deleteRoom(roomID: string) {
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].roomID === roomID) {
                this.rooms.splice(i, 1);
                this.observableRooms.next(this.rooms);
                break;
            }
        }
    }

    private restoreAllRooms(rooms: Room[]) {
        const roomsDto: RoomDto[] = rooms.map(
            (room): RoomDto => ({
                id: room.roomID,
                messages: room.messages.map((message): string => message.text),
            })
        );
        this.socket.emit("restoreRooms", roomsDto, (status: boolean) => {
            if (status) {
                console.log(rooms);
                for (let i = 0; i < rooms.length; i++) {
                    this.addRoom(roomsDto[i], rooms[i].name);
                }
            }
        });
    }
}
