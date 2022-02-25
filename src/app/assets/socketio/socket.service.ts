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
    rooms: Map<string, Room> = new Map<string, Room>();
    observableRooms: BehaviorSubject<Map<string, Room>> = new BehaviorSubject<
        Map<string, Room>
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
            this.addMessage(messageDto, false);
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
        const idRoom = this.rooms.size + 1;
        this.rooms.set(roomDto.id, {
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
        this.rooms.get(messageDto.roomID)?.messages.unshift({
            text: messageDto.text,
            isCurrenUserMessage: isCurrentUserMessage,
        });
    }

    private deleteRoom(roomID: string) {
        this.rooms.delete(roomID);
        this.observableRooms.next(this.rooms);
    }

    private restoreAllRooms(rooms: Map<string, Room>) {
        const roomsDto: RoomDto[] = [];
        rooms.forEach((value, key) => {
            roomsDto.push({
                id: value.roomID,
                messages: value.messages.map((message): string => message.text),
            });
        });
        this.socket.emit("restoreRooms", roomsDto, (status: boolean) => {
            if (status) {
                const roomsIterator = rooms.entries();
                for (let i = 0; i < rooms.size; i++) {
                    this.addRoom(roomsDto[i], roomsIterator.next().value.name);
                }
            }
        });
    }
}
