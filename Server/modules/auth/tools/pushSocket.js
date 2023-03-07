import wave from "../../../wave.js";

export default async (token, id) => {
    const result = await wave.addon.update("sessions", {token}, {$push: {sockets: id}});
        
    if(result.modifiedCount > 0) {
        return true;
    }else {
        return false;
    }
}