import post from "@mkoys/post";

import me from "./api/me.js";

const router = post.app();

router.get("/me", me);

export default router;