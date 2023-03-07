import wave from "../../../wave.js";

export default async (token) => {
    const result = await wave.addon.remove("sessions", {token});
    return result;
}