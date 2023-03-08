import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["status", "statusColor", "date"] }

    constructor() {
        super();
        this.date = new Date();
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
            const grab = firstInputRow.querySelector(".grab");
            this.emptyRow = firstInputRow.cloneNode(true);
            const firstDescription = firstInputRow.querySelector(".description");
            const firstTime = firstInputRow.querySelector(".time");
            const firstType = firstInputRow.querySelector(".type");
            const schoolCheckbox = this.shadowRoot.querySelector(".school");
            const companyCheckbox = this.shadowRoot.querySelector(".company");

            grab.addEventListener("click", () => this.getData())

            schoolCheckbox.addEventListener("click", () => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { companyCheckbox.action() }
            });

            companyCheckbox.addEventListener("click", () => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { schoolCheckbox.action() }
            });

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
                const newRowElement = this.emptyRow.cloneNode(true);

                const newGrab = newRowElement.querySelector(".grab");
                const newDescription = newRowElement.querySelector(".description");
                const newTime = newRowElement.querySelector(".time");
                const newType = newRowElement.querySelector(".type");

                newDescription.addEventListener("keyup", this.newRow);
                newTime.addEventListener("keyup", this.newRow);
                newType.addEventListener("keyup", this.newRow);

                content.appendChild(newRowElement);
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
            const newRowElement = this.emptyRow.cloneNode(true);
            const description = newRowElement.querySelector(".description");
            const time = newRowElement.querySelector(".time");
            const type = newRowElement.querySelector(".type");

            description.value = rowData.description;
            time.value = rowData.time;
            type.value = rowData.type;
            contentElement.appendChild(newRowElement);

            description.addEventListener("keyup", this.removeRow);
            time.addEventListener("keyup", this.removeRow);
            type.addEventListener("keyup", this.removeRow);
        });

        const newRowElement = this.emptyRow.cloneNode(true);
        const description = newRowElement.querySelector(".description");
        const time = newRowElement.querySelector(".time");
        const type = newRowElement.querySelector(".type");

        contentElement.appendChild(newRowElement);

        description.addEventListener("keyup", this.removeRow);
        time.addEventListener("keyup", this.removeRow);
        type.addEventListener("keyup", this.removeRow);

        description.addEventListener("keyup", this.newRow);
        time.addEventListener("keyup", this.newRow);
        type.addEventListener("keyup", this.newRow);
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
            data.content[index] = { description, time, type }
            index++;
        }

        console.log(data);
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
                this.date = new Date(newValue);
                dateElement.textContent = `${this.date.getDate()}. ${this.monthList[this.date.getMonth()]} ${this.date.getFullYear()}`;
                break;

            default:
                break;
        }
    }
}