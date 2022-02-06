import { Component } from "@angular/core";
import { MatSelectionListChange } from "@angular/material/list";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title: string = "chatmds";
    optionMenu: number = 1;

    onSelectOptionMenu(event: MatSelectionListChange): void {
        const first = 0;
        const numberOfOptionMenu = event.options[first].value;
        this.optionMenu = numberOfOptionMenu;
    }
}
