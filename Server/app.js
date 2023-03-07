import post from "@mkoys/post";

import modules from "./source/modules.js";
import database from "./source/database.js";
import websocket from "./source/websocket.js";

import readFile from "./utils/readFile.js";

const config = JSON.parse(readFile("config.json"));
const moduleList = JSON.parse(readFile("modules.json"));

const port = config?.port || 8000;
const loadedModules = await modules.load(moduleList);

database.space(config?.database.space);
await database.connect(config?.database.url);

const app = post.app();
const realtime = websocket({ server: app.server });

realtime.init();
modules.use(loadedModules, app);

app.listen(port, () => console.log(`Running on http://localhost:${port}`));