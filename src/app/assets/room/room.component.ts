import { Component, Input } from "@angular/core";
import { Room } from "../roomInterface";

@Component({
    selector: "app-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.css"],
})
export class RoomComponent {
    @Input() room!: Room;
    editNameMode = false;
}
