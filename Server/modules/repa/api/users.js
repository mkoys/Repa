import wave from "../../../wave.js";
import database from "../../../source/database.js";

export default async (req, res) => {
    const attendances = database.collection("repa");

    let token = req.headers.authorization;

    if (!token) { return res.json({ error: { token: "No token provided" } }) }

    token = token.split(" ")[1];

    const session = await wave.auth.getSession({ token });

    if (!session) { return res.json({ error: { session: "No session" } }) }

    const user = await wave.auth.getUser({ id: session.id });

    if (user.role !== "admin") {
        return res.json({ error: "Not authorized" });
    }

    const users = await wave.addon.readMany("users", {});

    for (const user of users) {
        user.submited = await attendances.countDocuments({ submited: true, id: user.id });
        user.accepted = await attendances.countDocuments({ accepted: true, id: user.id });
        user.declined = await attendances.countDocuments({ declined: true, id: user.id });

        delete user.password;
        delete user._id;
    }


    return res.json({ users });
}