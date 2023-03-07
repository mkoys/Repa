import { MongoClient } from "mongodb";

let connected = false;
let client = null;
let lastSpace = null;

async function connect(url, callback = () => { }) {
    client = new MongoClient(url);

    try { await client.connect() }
    catch (error) { return console.error("Couldn`t connect to database") }

    connected = true;
    callback();
    return true;
}

function space(spaceName) {
    lastSpace = spaceName;
    if (connected) { return client.db(spaceName) };
}

function collection(collectionName) {
    if (connected) { return client.db(lastSpace).collection(collectionName) }
} 

async function action(collectionName, performAction, primaryData, secodaryData) {
    if (connected) {
        const collection = client.db(lastSpace).collection(collectionName);
        let result = null;

        try { result = await collection[performAction](primaryData, secodaryData) }
        catch (error) { return console.error("Couldn`t perform action on database") }
        
        return result;
    }
}

export default {connect, space, collection, action}