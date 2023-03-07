import { nanoid } from "nanoid";

import websocket from "../../source/websocket.js";
import pushSocket from "./tools/pushSocket.js";
import pullSocket from "./tools/pullSocket.js";

export default async () => {
    const realtime = websocket();

    realtime.event("handshake", async (request, socket) => {
        let token = request.headers.authorization;

        if (!token) { return socket.decline() }

        const id = nanoid();

        const result = await pushSocket(token, id);

        if (!result) {
            return socket.decline()
        }
    });

    realtime.event("disconnect", async (request, socket) => {
        const result = await pullSocket(socket.token, socket.id);

        if (result) {
            socket.accept()
        } else {
            socket.decline()
        }
    });
}