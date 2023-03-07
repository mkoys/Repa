import database from "../../../source/database.js";

export default async (collection, data) => {
    return await database.action(collection, "insertOne", data);
}