import database from "../../../source/database.js";

export default async () => {
    const collection = database.collection("users");
    return await collection.countDocuments();
}