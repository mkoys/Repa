import read from "./database/read.js";
import readMany from "./database/readMany.js";
import insert from "./database/insert.js";
import remove from "./database/remove.js";
import update from "./database/update.js";

export default {
    tools: {
        read,
        readMany,
        insert,
        remove,
        update
    }
}