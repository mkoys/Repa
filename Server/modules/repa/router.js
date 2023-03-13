import post from "@mkoys/post";

import me from "./api/me.js";
import save from "./api/save.js";
import remove from "./api/delete.js";
import attendance from "./api/attendance.js";

const router = post.app();

router.get("/me", me);
router.get("/attendance", attendance);
router.post("/save", save);
router.post("/delete", remove);

export default router;