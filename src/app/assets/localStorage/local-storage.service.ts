import { Injectable } from "@angular/core";
import { Room } from "../roomInterface";
import { v4 as uuidv4 } from "uuid";

@Injectable({
    providedIn: "root",
})
export class LocalStorageService {
    private saveComputerID(computerID: string) {
        localStorage.setItem("computerID", computerID);
    }

    saveRooms(rooms: Map<string, Room>) {
        rooms.forEach((value) => {
            if (value.messages.length > 10) {
                value.messages.length = 10;
            }
        });

        localStorage.setItem("myRooms", JSON.stringify(Object.fromEntries(rooms)));
    }

    getComputerID(): string {
        const data = localStorage.getItem("computerID");

        if (data) {
            return data;
        } else {
            const computerID = uuidv4();
            this.saveComputerID(computerID);
            return computerID;
        }
    }

    getRooms(): Map<string, Room> | null {
        const data = localStorage.getItem("myRooms");

        if (data) return new Map(Object.entries(JSON.parse(data)));
        else return null;
    }
}
