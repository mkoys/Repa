import loginUser from "../tools/loginUser.js";

export default async (req, res) => {
    let data = null;

    try { data = JSON.parse(req.body) }
    catch (error) { return res.json({ error: "Invalid request" }) }

    const session = await loginUser(data);

    if (session.errors) { return res.json({ errors: session.errors }) }

    return res.json({ token: session.token });
}