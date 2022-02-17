import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSelectionListChange } from "@angular/material/list";
import { Room } from "./assets/roomInterface";
import RoomDto from "../../commonAssets/Room";
import { SocketService } from "./assets/socketio/socket.service";
import { Observable, Subject, takeUntil } from "rxjs";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, OnDestroy {
    title: string = "chatmds";
    optionMenu: number = 1;
    rooms: Array<Room> = [];
    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private socket: SocketService) {}

    ngOnInit(): void {
        this.socket.observableRooms
            .pipe(takeUntil(this.destroy$))
            .subscribe((rooms) => this.onChangeRooms(rooms));
    }

    onChangeRooms(rooms: Room[]) {
        this.rooms = rooms;
        this.optionMenu = this.rooms.length + 1;
    }

    addRoom(): void {
        this.socket.createRoom();
    }

    onSelectOptionMenu(event: MatSelectionListChange): void {
        const first = 0;
        const numberOfOptionMenu = event.options[first].value;
        this.optionMenu = numberOfOptionMenu;
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
