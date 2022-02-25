import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { ServerRoom, MessageDto } from "../../../../commonAssets/Room";
import { ClientRoom } from "../roomInterface";
import { BehaviorSubject } from "rxjs";
import { LocalStorageService } from "../localStorage/local-storage.service";

@Injectable({
    providedIn: "root",
})
export class SocketService {
    socket: Socket;
    rooms: Map<string, ClientRoom> = new Map<string, ClientRoom>();
    observableRooms: BehaviorSubject<Map<string, ClientRoom>> = new BehaviorSubject<
        Map<string, ClientRoom>
    >(this.rooms);
    computerID: string;

    constructor(private localStorage: LocalStorageService) {
        const computerID = this.localStorage.getComputerID();
        this.computerID = computerID;
        this.socket = io({
            query: {
                computerID: computerID,
            },
        });
        this.socket.on("newMessage", (messageDto: MessageDto) => {
            this.addMessage(messageDto);
        });

        const data = this.localStorage.getRooms();
        if (data) {
            this.restoreAllRooms(data);
        }

        window.addEventListener("beforeunload", (e) => {
            this.localStorage.saveRooms(this.rooms);
        });
    }

    createRoom(callback?: () => void): void {
        this.socket.emit("createRoom", null, (data: ServerRoom) => {
            this.addRoom(data);
            if (callback) {
                callback();
            }
        });
    }

    joinRoom(roomID: string, callback?: (a: boolean) => void): void {
        this.socket.emit("joinRoom", roomID, (data: ServerRoom) => {
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
        const messageDto: MessageDto = {
            text: message,
            roomID: roomID,
            computerID: this.computerID,
        };
        this.socket.emit("sendMessage", messageDto, () => {
            this.addMessage(messageDto);
            if (callback) {
                callback();
            }
        });
    }

    private addRoom(room: ServerRoom, roomName?: string): void {
        const idRoom = this.rooms.size + 1;
        this.rooms.set(room.id, {
            messages: room.messages,
            name: roomName || "Pokój " + idRoom,
            id: room.id,
        });
        this.observableRooms.next(this.rooms);
    }

    private addMessage(messageDto: MessageDto) {
        this.rooms.get(messageDto.roomID)?.messages.unshift(messageDto);
    }

    private deleteRoom(roomID: string) {
        this.rooms.delete(roomID);
        this.observableRooms.next(this.rooms);
    }

    private restoreAllRooms(rooms: Map<string, ClientRoom>) {
        const roomsDto = Object.fromEntries(rooms);
        this.socket.emit("restoreRooms", roomsDto, (status: boolean) => {
            if (status) {
                rooms.forEach((value) => {
                    this.addRoom(value, value.name);
                });
            }
        });
    }
}
