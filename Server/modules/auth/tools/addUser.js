import wave from "../../../wave.js";

import createUser from "../library/createUser.js";

export default async (data) => {
    const user = await createUser(data);
    await wave.addon.insert("users", user);
    wave.eventTrigger("userAdd", user);
}