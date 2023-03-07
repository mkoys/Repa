import wave from "../../../wave.js";

export default async (filter) => {
    
    const session = await wave.addon.read("sessions", filter);
    
    if(!session) {
        return false;
    }

    const user = await wave.addon.read("users", {id: session.id});

    delete user._id;

    return user;
}