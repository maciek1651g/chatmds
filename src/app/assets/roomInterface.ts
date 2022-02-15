export interface Room {
    name: string;
    roomID: string;
    messages: Array<Message>;
}

export interface Message {
    text: string;
    isCurrenUserMessage: boolean;
}
