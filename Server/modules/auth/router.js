import post from "@mkoys/post";

import register from "./api/register.js";
import login from "./api/login.js";
import logout from "./api/logout.js";

const router = post.app();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

export default router;