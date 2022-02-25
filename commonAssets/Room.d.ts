export interface ServerRoom {
    id: string;
    messages: Message[];
}
export interface Message {
    text: string;
    computerID: string;
}
export interface MessageDto {
    text: string;
    roomID: string;
    computerID: string;
}
