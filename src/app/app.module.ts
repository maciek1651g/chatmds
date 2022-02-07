import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./assets/header/header.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatListModule } from "@angular/material/list";
import { FormsModule } from "@angular/forms";
import { MainPageComponent } from "./assets/main-page/main-page.component";
import { RoomComponent } from "./assets/room/room.component";
import { MatInputModule } from "@angular/material/input";
import { InputTextModule } from "primeng/inputtext";

@NgModule({
    declarations: [AppComponent, HeaderComponent, MainPageComponent, RoomComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
        MatGridListModule,
        MatListModule,
        FormsModule,
        MatInputModule,
        InputTextModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
