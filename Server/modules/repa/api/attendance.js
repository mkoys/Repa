import wave from "../../../wave.js";

export default async (req, res) => {
    let token = req.headers.authorization;

    if (!token) { return res.json({ error: { token: "No token provided" } }) }

    token = token.split(" ")[1];

    const session = await wave.auth.getSession({ token });

    if (!session) { return res.json({ error: { session: "No session" } }) }

    const attendance = await wave.addon.readMany("repa", null, { id: session.id });

    for(const item of attendance) {
        delete item.id;
        delete item._id;
    }

    return res.json(attendance);
}