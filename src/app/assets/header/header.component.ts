import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
    @Output() menuButtonClick: EventEmitter<void> = new EventEmitter();

    hubButtonClicked(): void {
        this.menuButtonClick.emit();
    }
}
