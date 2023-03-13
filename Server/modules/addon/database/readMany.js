import database from "../../../source/database.js";

export default async (collection, filter, template) => {
    return await (await database.action(collection, "find", template, filter)).toArray();
}