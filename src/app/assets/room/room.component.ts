import { Component, Input } from "@angular/core";
import { Room } from "../roomInterface";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.css"],
})
export class RoomComponent {
    @Input() room!: Room;
    editNameMode = false;

    constructor(private snackBar: MatSnackBar) {}

    copyRoomID() {
        navigator.clipboard.writeText(this.room.roomID);
        this.snackBar.open("Skopiowano ID pokoju", "Zamknij", {
            duration: 1500,
            horizontalPosition: "end",
            verticalPosition: "top",
        });
    }
}
