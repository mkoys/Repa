import Router from "./source/Router.js";

let routerInstance;

const init = (rootElement = "body") => {
    const root = document.querySelector(rootElement);
    routerInstance = new Router({ root });
}

const router = () => {
    return routerInstance;
}

export default { init, router }
    