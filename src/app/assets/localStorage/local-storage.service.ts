import { Injectable } from "@angular/core";
import { Room } from "../roomInterface";

@Injectable({
    providedIn: "root",
})
export class LocalStorageService {
    saveData(rooms: Room[]) {
        localStorage.setItem("myRooms", JSON.stringify(rooms));
    }

    getData(): Room[] | null {
        const data = localStorage.getItem("myRooms");

        if (data) return JSON.parse(data);
        else return null;
    }
}
