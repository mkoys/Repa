import router from "./router.js";
import realtime from "./realtime.js";

import registerUser from "./tools/registerUser.js";
import loginUser from "./tools/loginUser.js";
import logoutUser from "./tools/logoutUser.js";
import addUser from "./tools/addUser.js";
import getUser from "./tools/getUser.js";

import getSession from "./tools/getSession.js";
import addSession from "./tools/addSession.js";
import pushSocket from "./tools/pushSocket.js";
import pullSocket from "./tools/pullSocket.js";

export default {
    router,
    realtime,
    tools: {
        getSession,
        addUser,
        registerUser,
        loginUser,
        logoutUser,
        addSession,
        pushSocket,
        pullSocket,
        getUser
    }
}