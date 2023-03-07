import { hashSync, compareSync } from "bcrypt";
import wave from "../../../wave.js";

export default async (rule, data, field, value) => {
    let error = false;
    
    switch (rule) {
        // Data must be defined
        case "required":
            if (!data[field]) { error = true }
            break;
        // Data must match type
        case "type":
            if (!data[field]) { break }
            if (typeof value !== typeof data[field]) { error = true }
            break;
        // Minimum character amount
        case "min":
            if (!data[field]) { break }
            if (data[field].length < value) { error = true }
            break;
        // Maximum character amount
        case "max":
            if (!data[field]) { break }
            if (data[field].length > value) { error = true }
            break;
        // Field must match another field
        case "match":
            if (!data[field]) { break }
            if (data[field] !== data[value]) { error = true }
            break;
        // Data must contain one or the other
        case "or":
            if (!data[value] && !data[field]) { error = true }
            break;
        // Removes field from data
        case "delete":
            delete data[field];
            break;
        // Sets field to lowecase
        case "lowercase":
            data[field] = data[field].toLowerCase();
            break;
        // Hashes field with bcrypt
        case "encrypt":
            data[field] = hashSync(data[field], 7);
            break;
        // Tries to login user with field and value as password that has encryption
        case "auth":
            if (!data[field]) { break }

            const userFilter = {};
            userFilter[field] = new RegExp(data[field], "i");

            const user = await wave.addon.read("users", userFilter);
            if (!user) { error = true; break; }

            const compare = compareSync(data[value], user[value]);
            if (!compare) { error = true }
            break;
        // Finds duplicate data in users
        case "duplicate":
            let filter = {};
            filter[field] = data[field];

            const found = await wave.addon.read("users", filter);

            if (found === false) { return false }
            if (found) { error = true }
            break;
        default:
            error = true;
            break;
    }

    return { data, error };
}