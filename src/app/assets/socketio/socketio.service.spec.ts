import { TestBed } from "@angular/core/testing";

import { SocketService } from "./socket.service";

describe("SocketioService", () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});