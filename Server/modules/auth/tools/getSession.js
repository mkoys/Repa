import wave from "../../../wave.js";

export default async (filter) => {
    const session = await wave.addon.read("sessions", filter);
    return session;
}