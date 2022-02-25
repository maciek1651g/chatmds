import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    QueryList,
    ViewChild,
    ViewChildren,
} from "@angular/core";
import { ClientRoom } from "../roomInterface";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "../socketio/socket.service";

@Component({
    selector: "app-room",
    templateUrl: "./room.component.html",
    styleUrls: ["./room.component.css"],
})
export class RoomComponent implements AfterViewInit {
    @Input() room!: ClientRoom;
    editNameMode = false;
    message?: string;
    @ViewChild("chatContainer") chatContainer!: ElementRef;
    @ViewChildren("message") messages!: QueryList<any>;

    constructor(private snackBar: MatSnackBar, public socket: SocketService) {}

    ngAfterViewInit(): void {
        this.messages.changes.subscribe((_) => this.onAddMessage());
    }

    copyRoomID() {
        navigator.clipboard.writeText(this.room.id);
        this.snackBar.open("Skopiowano ID pokoju", "Zamknij", {
            duration: 1500,
            horizontalPosition: "end",
            verticalPosition: "top",
        });
    }

    sendMessage() {
        if (this.message && this.message !== "") {
            this.socket.sendMessage(this.message, this.room.id);
            this.message = "";
        }
    }

    leaveRoom(): void {
        this.socket.leaveRoom(this.room.id);
    }

    onAddMessage(): void {
        if (this.isUserNearBottom()) {
            this.chatContainer.nativeElement.scroll({
                top: this.chatContainer.nativeElement.scrollHeight,
                left: 0,
                behavior: "smooth",
            });
        }
    }

    private isUserNearBottom(): boolean {
        const offset = 150;
        const position = this.chatContainer.nativeElement.scrollTop;
        return position + offset > 0;
    }
}
