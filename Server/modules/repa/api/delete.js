import wave from "../../../wave.js";

export default async (req, res) => {
    let token = req.headers.authorization;
    let data;

    if (!req.body) { return res.json({ error: { token: "Invalid data" } }) }

    try { data = JSON.parse(req.body) }
    catch (error) { console.error(error) }

    if (!token) { return res.json({ error: { token: "No token provided" } }) }

    token = token.split(" ")[1];

    const session = await wave.auth.getSession({ token });

    if (!session) { return res.json({ error: { session: "No session" } }) }

    if (!data) { return res.json({ error: { token: "Invalid data" } }) }

    await wave.addon.remove("repa", { id: session.id, date: data.date });

    return res.json({ message: "ok" });
}