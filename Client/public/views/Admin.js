import config from "../config.js";
import marble from "../marble.js";
import BaseComponent from "../source/BaseComponent.js";

export default class Repa extends BaseComponent {
    constructor() {
        super();

        this.addStyle("/style.css");
        this.addStyle("/views/Admin.css");
        this.useTemplate("/views/Admin.html");
    }
}