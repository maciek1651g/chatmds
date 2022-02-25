import { Message } from "../../../commonAssets/Room";

export interface ClientRoom {
    name: string;
    id: string;
    messages: Message[];
}
