import resourceMap from "./resourceMap.js";

export default class BaseComponent extends HTMLElement {
    constructor({ } = {}) {
        super();
        this.attachShadow({ mode: "open" });
        this.connectedCallback = () => {};
        this.connected = (callback) => this.connectedCallback = callback;
        this.loadCallback;
        this.load = new Promise(resolve => {
            this.loadCallback = () => {
                resolve();
            }
        });
    }

    async useTemplate(templatePath, currentPath) {
        const parser = new DOMParser();

        let originalURL = null;

        if (currentPath) {
            originalURL = currentPath;
        } else {
            originalURL = new URL("..", import.meta.url);
        }

        const finalPath = new URL(templatePath, originalURL).pathname;

        const found = await resourceMap.get(finalPath);
        const parsedTemplate = parser.parseFromString(found, "text/html");
        const template = parsedTemplate.querySelector("template").content;

        this.shadowRoot.appendChild(template.cloneNode(true));
        this.loadCallback();
        this.connectedCallback();
    }

    async addStyle(path, currentPath) {
        const styleElement = document.createElement("style");

        let originalURL = null;

        if (currentPath) {
            originalURL = currentPath;
        } else {
            originalURL = new URL("..", import.meta.url);
        }

        const finalPath = new URL(path, originalURL).pathname;

        const found = await resourceMap.get(finalPath);
        styleElement.textContent = found;

        this.shadowRoot.appendChild(styleElement);
    }
}