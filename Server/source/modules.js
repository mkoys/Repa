import wave from "../wave.js";

async function load(moduleList) {
    let modules = [];

    for (let moduleItem of moduleList) {
        const module = await import("../modules/" + moduleItem.path);
        moduleItem = { ...moduleItem, ...module.default };
        modules.push(moduleItem);
    }

    return modules;
}

function use(modules, application) {
    const newModules = hydrateModules(modules); 
    
    for (const module of newModules) {
        if (module.init) { module.init() }
        if (module.tools) { wave[module.name] = module.tools }
        if (module.router) { application.use(`/${module.name}`, module.router) }
        if (module.realtime) { module.realtime() }
    }

    return 0;
}

function hydrateModules(modules) {
    let newModules = [];
    for(const module of modules) {
        if(Array.isArray(module)) {
            const hydrated = hydrateModules(module);
            newModules = [...newModules, ...hydrated];
        }else {
            newModules.push(module);
        }
    }

    return newModules;
}

export default { load, use };