import { Component, Input } from "@angular/core";
import { Room } from "../roomInterface";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "../socketio/socket.service";

@Component({
    selector: "app-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.css"],
})
export class RoomComponent {
    @Input() room!: Room;
    editNameMode = false;
    message?: string;

    constructor(private snackBar: MatSnackBar, private socket: SocketService) {}

    copyRoomID() {
        navigator.clipboard.writeText(this.room.roomID);
        this.snackBar.open("Skopiowano ID pokoju", "Zamknij", {
            duration: 1500,
            horizontalPosition: "end",
            verticalPosition: "top",
        });
    }

    sendMessage() {
        if (this.message && this.message !== "") {
            this.socket.sendMessage(this.message, this.room.roomID);
        }
    }
}
