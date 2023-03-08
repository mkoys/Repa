import wave from "../../../wave.js";

export default async (req, res) => {
    let token = req.headers.authorization;
    let data;

    try { data = JSON.parse(req.body) }
    catch (error) { console.error(error) }

    if (!token) { return res.json({ error: { token: "No token provided" } }) }

    token = token.split(" ")[1];

    const session = await wave.auth.getSession({ token });

    if (!session) { return res.json({ error: { session: "No session" } }) }

    if (!data) { return res.json({ error: { token: "Invalid data" } }) }

    const found = await wave.addon.read("repa", { date: data.date, id: session.id });

    if (found) {
        wave.addon.update("repa", { id: session.id, date: data.date }, { $set: { content: data.content, where: data.where } });
    } else {
        wave.addon.insert("repa", { id: session.id, content: data.content, date: data.date, where: data.where });
    }

    return res.json({message: "ok"});
}