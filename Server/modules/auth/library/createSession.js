import { nanoid } from "nanoid"

export default (id) => {
    if (id === undefined) { return false }

    const token = nanoid(16);

    const newSession = {
        id,
        token,
        sockets: []
    }
    
    return newSession;
}