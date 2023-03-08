import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["status", "statuscolor", "date", "loading", "disableinput"] }

    constructor() {
        super();
        this.date = new Date();
        this.saveCallback = () => { };
        this.closeCallback = () => { };
        this.monthList = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Decr"
        ];

        this.addStyle("/style.css");
        this.addStyle("/components/Attendance.css");
        this.useTemplate("/components/Attendance.html");

        this.connected(async () => {
            await this.load;
            const firstInputRow = this.shadowRoot.querySelector(".inputRow");
            const schoolCheckbox = this.shadowRoot.querySelector(".school");
            const companyCheckbox = this.shadowRoot.querySelector(".company");
            const saveButton = this.shadowRoot.querySelector(".save");
            const closeButton = this.shadowRoot.querySelector(".close");

            this.emptyRow = firstInputRow.cloneNode(true);

            const firstGrab = firstInputRow.querySelector(".grab");
            const firstDescription = firstInputRow.querySelector(".description");
            const firstTime = firstInputRow.querySelector(".time");
            const firstType = firstInputRow.querySelector(".type");

            closeButton.addEventListener("click", () => this.closeCallback());

            schoolCheckbox.change(() => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { companyCheckbox.action() }
            });

            companyCheckbox.change(() => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { schoolCheckbox.action() }
            });

            saveButton.addEventListener("click", () => this.saveCallback());

            firstDescription.addEventListener("keyup", this.newRow);
            firstTime.addEventListener("keyup", this.newRow);
            firstType.addEventListener("keyup", this.newRow);
        });

        this.newRow = (event) => {
            const row = event.target.parentNode;
            const description = row.querySelector(".description");
            const time = row.querySelector(".time");
            const type = row.querySelector(".type");

            if (description.value.length != 0 || time.value.length != 0 || type.value.length != 0) {
                description.addEventListener("keyup", this.removeRow);
                time.addEventListener("keyup", this.removeRow);
                type.addEventListener("keyup", this.removeRow);

                description.removeEventListener("keyup", this.newRow);
                time.removeEventListener("keyup", this.newRow);
                type.removeEventListener("keyup", this.newRow);

                const content = this.shadowRoot.querySelector(".content");
                const newRow = this.createRow();

                newRow.description.addEventListener("keyup", this.newRow);
                newRow.time.addEventListener("keyup", this.newRow);
                newRow.type.addEventListener("keyup", this.newRow);

                content.appendChild(newRow.rowElement);
            }
        }

        this.removeRow = (event) => {
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

    close(callback) { this.closeCallback = callback }

    save(callback) { this.saveCallback = callback }

    async setData(data) {
        await this.load;
        this.setAttribute("date", data.date)
        const contentElement = this.shadowRoot.querySelector(".content");
        const schoolCheckbox = this.shadowRoot.querySelector(".school");
        const companyCheckbox = this.shadowRoot.querySelector(".company");

        contentElement.innerHTML = "";

        if (data.where) {
            if (data.where === "company") {
                if (!companyCheckbox.checked) { companyCheckbox.action() }
            } else if (data.where === "school") {
                if (!schoolCheckbox.checked) { schoolCheckbox.action() }
            }
        }

        data.content.forEach((rowData, index) => {
            const newRow = this.createRow();

            newRow.description.value = rowData.description;
            newRow.time.value = rowData.time;
            newRow.type.value = rowData.type;
            contentElement.appendChild(newRow.rowElement);

            newRow.description.addEventListener("keyup", this.removeRow);
            newRow.time.addEventListener("keyup", this.removeRow);
            newRow.type.addEventListener("keyup", this.removeRow);
        });

        const newRow = this.createRow();

        contentElement.appendChild(newRow.rowElement);

        newRow.description.addEventListener("keyup", this.removeRow);
        newRow.time.addEventListener("keyup", this.removeRow);
        newRow.type.addEventListener("keyup", this.removeRow);

        newRow.description.addEventListener("keyup", this.newRow);
        newRow.time.addEventListener("keyup", this.newRow);
        newRow.type.addEventListener("keyup", this.newRow);
    }

    createRow() {
        const rowElement = this.emptyRow.cloneNode(true);
        const grab = rowElement.querySelector(".grab");
        const description = rowElement.querySelector(".description");
        const time = rowElement.querySelector(".time");
        const type = rowElement.querySelector(".type");

        return { rowElement, grab, description, time, type }
    }

    getData() {
        const data = {
            date: this.date,
            content: [],
            where: null
        };

        const contentElement = this.shadowRoot.querySelector(".content");
        const schoolCheckbox = this.shadowRoot.querySelector(".school");
        const companyCheckbox = this.shadowRoot.querySelector(".company");

        if (schoolCheckbox.checked) {
            data.where = "school";
        } else if (companyCheckbox.checked) {
            data.where = "company";
        }

        let index = 0;
        for (const inputRow of contentElement.children) {
            const description = inputRow.querySelector(".description").value;
            const time = inputRow.querySelector(".time").value;
            const type = inputRow.querySelector(".type").value;

            if (description !== "" || time !== "" || type !== "") {
                data.content[index] = { description, time, type }
                index++;
            }
        }

        return data;
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        const statusElement = this.shadowRoot.querySelector(".status");
        const dateElement = this.shadowRoot.querySelector(".date");
        const content = this.shadowRoot.querySelector(".content");
        const buttons = this.shadowRoot.querySelectorAll(".button");
        const schoolCheckbox = this.shadowRoot.querySelector(".school");
        const companyCheckbox = this.shadowRoot.querySelector(".company");
        
        switch (name) {
            case "statuscolor":
                statusElement.style.color = newValue;
                break;
            case "status":
                statusElement.textContent = newValue;
                break;
            case "date":
                this.date = new Date(newValue);
                dateElement.textContent = `${this.date.getDate()}. ${this.monthList[this.date.getMonth()]} ${this.date.getFullYear()}`;
                break;
            case "loading":
                const loading = this.shadowRoot.querySelector(".loading");
                newValue = JSON.parse(newValue);
                if (newValue) {
                    loading.classList.add("load");
                } else {
                    loading.classList.remove("load");
                }
                break;
            case "disableinput":
                newValue = JSON.parse(newValue);
                schoolCheckbox.setAttribute("disable", newValue);
                companyCheckbox.setAttribute("disable", newValue);

                for (const button of buttons) {
                    button.disabled = newValue;
                }

                for (const row of content.children) {
                    const description = row.querySelector(".description");
                    const time = row.querySelector(".time");
                    const type = row.querySelector(".type");

                    description.disabled = newValue;
                    time.disabled = newValue;
                    type.disabled = newValue;
                }
                break;
            default:
                break;
        }
    }
}