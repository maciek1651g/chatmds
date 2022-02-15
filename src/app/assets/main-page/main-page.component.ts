import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SocketService } from "../socketio/socket.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-main-page",
    templateUrl: "./main-page.component.html",
    styleUrls: ["./main-page.component.css"],
})
export class MainPageComponent {
    @Output() addNewRoom = new EventEmitter<void>();
    @Output() joinToNewRoom = new EventEmitter<void>();
    roomID: string = "";

    constructor(private socket: SocketService, private snackBar: MatSnackBar) {}

    joinRoom(): void {
        this.socket.joinRoom(this.roomID, (success) => {
            if (!success) {
                this.snackBar.open("Nie znaleziono pokoju o takim ID", "Zamknij", {
                    duration: 1500,
                    horizontalPosition: "end",
                    verticalPosition: "top",
                });
            } else {
                this.joinToNewRoom.emit();
            }
        });
    }
}
