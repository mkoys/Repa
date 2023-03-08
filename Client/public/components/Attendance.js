import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["status", "statusColor", "date"] }

    constructor() {
        super();

        this.addStyle("/style.css");
        this.addStyle("/components/Attendance.css");
        this.useTemplate("/components/Attendance.html");
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        const statusElement = this.shadowRoot.querySelector(".status");
        const dateElement = this.shadowRoot.querySelector(".date");

        switch (name) {
            case "statusColor":
                statusElement.style.color = newValue;
                break;
            case "status":
                statusElement.textContent = newValue;
                break;
            case "date":
                dateElement.textContent = newValue;
                break;

            default:
                break;
        }
    }
}