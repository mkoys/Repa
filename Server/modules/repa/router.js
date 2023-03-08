import post from "@mkoys/post";

import me from "./api/me.js";
import save from "./api/save.js";
import attendance from "./api/attendance.js";

const router = post.app();

router.get("/me", me);
router.get("/attendance", attendance);
router.post("/save", save);

export default router;