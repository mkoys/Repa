import wave from "../../../wave.js";

import addUser from "../tools/addUser.js";
import processData from "../library/processData.js";

export default async (data) => {
    const registerData = await wave.addon.read("data", { name: "register" });

    if (registerData === false) { return { error: "No register data were found" } }

    const dataErrors = await processData(registerData.rules, data, true);
    if (dataErrors.errors.length) { return dataErrors }

    const processErrors = await processData(registerData.process, data);
    if (processErrors.errors.length) { return processErrors }

    await addUser(data);

    return { success: "User created" }
}