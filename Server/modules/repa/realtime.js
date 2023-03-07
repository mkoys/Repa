import wave from "../../wave.js";

import database from "../../source/database.js";
import websocket from "../../source/websocket.js";

export default () => {
    const realtime = websocket();

    realtime.event("connect", async (requrest, socket) => {
        const session = await wave.auth.getSession({ token: socket.token });
        const users = database.collection("users");
 
        const userWatch = users.watch([{ $match: { operationType: "update" }  }, { $match: { "fullDocument.id": session.id }  }], { fullDocument : "updateLookup" });

        userWatch.on("change", (event) => {
            socket.send(event.fullDocument);
        });
    });

    wave.event("userAdd", (user) => {
        wave.addon.update("users", user, { $set: { role: "student" } });
    });
}