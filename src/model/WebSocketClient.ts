import { type ExtendedWebSocket } from "websocket-express";
import { v4 as uuidv4 } from "uuid";

export class WebSocketClient {
    
    username: string;
    websocket: ExtendedWebSocket;
    /**
     * The unique identifier for this client as a UUID.
     */
    id: string;
    
    constructor(
        username: string,
        websocket: ExtendedWebSocket,
        id: string = uuidv4()
    ) {
        this.username = username;
        this.websocket = websocket;
        this.id = id;
    }

    /**
     * Sends a JSON message to the client.
     * 
     * @param data the data to send to the client, which will be serialized to
     * JSON using JSON.stringify.
     */
    sendJSON(data: any): void {
        this.websocket.send(JSON.stringify(data));
    }

}
