import wave from "../../../wave.js";

export default async (req, res) => {
    let data;
    let token = req.headers.authorization;

    if (!req.body) { return res.json({ error: { token: "Invalid data" } }) }

    try { data = JSON.parse(req.body) }
    catch (error) { console.error(error) }

    if (typeof data.id === "undefined") { return res.json({ error: { token: "No ID provided" } }) }

    if (!token) { return res.json({ error: { token: "No token provided" } }) }

    token = token.split(" ")[1];

    const session = await wave.auth.getSession({ token });

    if (!session) { return res.json({ error: { session: "No session" } }) }

    const attendance = await wave.addon.readMany("repa", null, { id: data.id });

    for (const item of attendance) {
        delete item.id;
        delete item._id;
    }

    return res.json(attendance);
}