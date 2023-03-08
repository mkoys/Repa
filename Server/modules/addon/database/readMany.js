import database from "../../../source/database.js";

export default async (collection, filter) => {
    return await (await database.action(collection, "find", {}, filter)).toArray();
}