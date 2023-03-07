import registerUser from "../tools/registerUser.js";

export default async (req, res) => {
    let data = null;

    try { data = JSON.parse(req.body) }
    catch (error) { return res.json({ error: "Invalid request" }) }

    const result = await registerUser(data);
    return res.json(result);
}