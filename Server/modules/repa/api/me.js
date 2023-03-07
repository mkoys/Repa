import wave from "../../../wave.js";

export default async (req, res) => {
    let token = req.headers.authorization;

    if (!token) { return res.json({ error: { token: "No token provided" } }) }

    token = token.split(" ")[1];

    const session = await wave.auth.getSession({ token });

    if (!session) { return res.json({ error: { session: "No session" } }) }

    const user = await wave.auth.getUser({ id: session.id });

    delete user.password;
    delete user._id;

    return res.json(user);
}