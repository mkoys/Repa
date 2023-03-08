import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["status", "statusColor", "date"] }

    constructor() {
        super();

        this.controller = new AbortController();
        this.addStyle("/style.css");
        this.addStyle("/components/Attendance.css");
        this.useTemplate("/components/Attendance.html");

        this.connected(async () => {
            await this.load;
            const fistInputRow = this.shadowRoot.querySelector(".inputRow");
            this.emptyRow = fistInputRow.cloneNode(true);
            const firstDescription = fistInputRow.querySelector(".description");
            const firstTime = fistInputRow.querySelector(".time");
            const firstType = fistInputRow.querySelector(".type");
            const schoolCheckbox = this.shadowRoot.querySelector(".school");
            const companyCheckbox = this.shadowRoot.querySelector(".company");

            schoolCheckbox.addEventListener("click", () => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { companyCheckbox.action() }
            });

            companyCheckbox.addEventListener("click", () => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { schoolCheckbox.action() }
            });

            firstDescription.addEventListener("keyup", newRow);
            firstTime.addEventListener("keyup", newRow);
            firstType.addEventListener("keyup", newRow);
        });

        const newRow = (event) => {
            const row = event.target.parentNode;
            const description = row.querySelector(".description");
            const time = row.querySelector(".time");
            const type = row.querySelector(".type");

            if (description.value.length != 0 || time.value.length != 0 || type.value.length != 0) {
                description.addEventListener("keyup", removeRow);
                time.addEventListener("keyup", removeRow);
                type.addEventListener("keyup", removeRow);

                description.removeEventListener("keyup", newRow);
                time.removeEventListener("keyup", newRow);
                type.removeEventListener("keyup", newRow);

                const content = this.shadowRoot.querySelector(".content");
                const newRowElement = this.emptyRow.cloneNode(true);

                const newDescription = newRowElement.querySelector(".description");
                const newTime = newRowElement.querySelector(".time");
                const newType = newRowElement.querySelector(".type");

                newDescription.addEventListener("keyup", newRow);
                newTime.addEventListener("keyup", newRow);
                newType.addEventListener("keyup", newRow);

                content.appendChild(newRowElement);
            }
        }

        const removeRow = (event) => {
            const row = event.target.parentNode;
            const content = row.parentNode;
            const description = row.querySelector(".description");
            const time = row.querySelector(".time");
            const type = row.querySelector(".type");

            if (description.value.length == 0 && time.value.length == 0 && type.value.length == 0 && content.children.length != 1) {
                content.removeChild(row);
            }
        }
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