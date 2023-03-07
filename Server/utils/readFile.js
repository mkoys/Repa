import { readFileSync } from "fs";

export default (filename) => {
    let file = null;
    const rootPath = "..";
    const currentPath = import.meta.url;
    const rootFolderPath = new URL(rootPath, currentPath);
    const configPath = new URL(filename, rootFolderPath).pathname;

    try { file = readFileSync(configPath, "utf-8") }
    catch (error) { console.error("Could not read file properly") }

    return file;
}