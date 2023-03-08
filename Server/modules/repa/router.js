import post from "@mkoys/post";

import me from "./api/me.js";
import save from "./api/save.js";

const router = post.app();

router.get("/me", me);
router.post("/save", save);

export default router;