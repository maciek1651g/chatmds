import { Component } from "@angular/core";
import { MatSelectionListChange } from "@angular/material/list";
import { Room } from "./assets/roomInterface";
import RoomDto from "../../commonAssets/Room";
import { SocketService } from "./assets/socketio/socket.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title: string = "chatmds";
    optionMenu: number = 1;
    Rooms: Array<Room> = [];

    constructor(private socket: SocketService) {}

    addRoom(): void {
        let idRoom = this.Rooms.length + 2;
        this.optionMenu = idRoom;
        this.socket.createRoom((data: RoomDto) => {
            this.Rooms.push({
                id: idRoom,
                messages: data.messages,
                name: "Pokój " + (idRoom - 1),
                roomID: data.id,
            });
        });
    }

    onSelectOptionMenu(event: MatSelectionListChange): void {
        const first = 0;
        const numberOfOptionMenu = event.options[first].value;
        this.optionMenu = numberOfOptionMenu;
    }
}
