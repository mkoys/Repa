import database from "../../../source/database.js";

export default async (collection, filter) => {
    return await database.action(collection, "deleteOne", filter);
}