import { Injectable } from "@angular/core";
import { Room } from "../roomInterface";

@Injectable({
    providedIn: "root",
})
export class LocalStorageService {
    saveData(rooms: Room[]) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].messages.length > 10) {
                rooms[i].messages.length = 10;
            }
        }

        localStorage.setItem("myRooms", JSON.stringify(rooms));
    }

    getData(): Room[] | null {
        const data = localStorage.getItem("myRooms");

        if (data) return JSON.parse(data);
        else return null;
    }
}
