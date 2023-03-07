import database from "../../../source/database.js";

export default async (collection, filter, data) => {
    return await database.action(collection, "updateOne", filter, data);
}