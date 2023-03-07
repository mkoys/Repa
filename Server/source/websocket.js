import flash from "@mkoys/flash";

let websocket = null;

export default (args) => {
    if (websocket) {
        return websocket;
    } else {
        websocket = flash(args);
        return websocket;
    }
}
