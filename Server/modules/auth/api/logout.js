import logoutUser from "../tools/logoutUser.js";

export default async (req, res) => {

    let token = req.headers?.authorization;

    if (token) { token = token.split(" ")[1] }

    await logoutUser(token);

    return res.sendStatus(200);
}