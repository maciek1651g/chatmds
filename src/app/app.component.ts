import { Component } from "@angular/core";
import { MatSelectionListChange } from "@angular/material/list";

interface Room {
    id: number;
    name: string;
    messages: Array<string>;
}

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title: string = "chatmds";
    optionMenu: number = 1;
    Rooms: Array<Room> = [];

    addRoom(): void {
        let idRoom = this.Rooms.length + 2;
        this.Rooms.push({ id: idRoom, messages: [], name: "Pokój " + idRoom });
        this.optionMenu = idRoom;
    }

    onSelectOptionMenu(event: MatSelectionListChange): void {
        const first = 0;
        const numberOfOptionMenu = event.options[first].value;
        this.optionMenu = numberOfOptionMenu;
    }
}
