import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return [] }

    constructor() {
        super();

        this.addStyle("/style.css");
        this.addStyle("/components/Attendance.css");
        this.useTemplate("/components/Attendance.html");
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;

    }
}