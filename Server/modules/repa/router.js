import post from "@mkoys/post";

import me from "./api/me.js";
import save from "./api/save.js";
import remove from "./api/delete.js";
import users from "./api/users.js";
import attendance from "./api/attendance.js";

const router = post.app();

router.get("/me", me);
router.post("/save", save);
router.get("/users", users);
router.post("/delete", remove);
router.get("/attendance", attendance);

export default router;