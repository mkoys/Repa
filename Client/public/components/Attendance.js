import config from "../config.js";
import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() {
        return [
            "status",
            "statuscolor",
            "date",
            "loading",
            "disableinput",
            "disablesave",
            "disablemore",
            "disablesubmit"
        ]
    }

    constructor() {
        super();
        this.date = new Date();
        this.saveCallback = () => { };
        this.submitCallback = () => { };
        this.closeCallback = () => { };
        this.removeCallback = () => { };
        const htmlParser = new DOMParser();
        const emptyRowHtml = `
            <svg class="grab" xmlns="http://www.w3.org/2000/svg" width="11" height="16" viewBox="0 0 11 16">
                <circle cx="2" cy="14" r="2" fill="#D9D9D9" />
                <circle cx="9" cy="14" r="2" fill="#D9D9D9" />
                <circle cx="2" cy="8" r="2" fill="#D9D9D9" />
                <circle cx="9" cy="8" r="2" fill="#D9D9D9" />
                <circle cx="2" cy="2" r="2" fill="#D9D9D9" />
                <circle cx="9" cy="2" r="2" fill="#D9D9D9" />
            </svg>
            <input type="text" placeholder="Description" class="description inputSpacing">
            <input type="text" placeholder="Time" class="time inputSpacing">
            <input type="text" placeholder="Class" class="type">
        `;

        const emptyContent = htmlParser.parseFromString(emptyRowHtml, "text/html").body;
        this.emptyRow = document.createElement("div");
        this.emptyRow.classList.add("inputRow");
        this.emptyRow.innerHTML = emptyContent.innerHTML;

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
            const schoolCheckbox = this.shadowRoot.querySelector(".school");
            const companyCheckbox = this.shadowRoot.querySelector(".company");
            const saveButton = this.shadowRoot.querySelector(".save");
            const submitButton = this.shadowRoot.querySelector(".submit");
            const closeButton = this.shadowRoot.querySelector(".close");
            const contentElement = this.shadowRoot.querySelector(".content");
            const more = this.shadowRoot.querySelector(".more");
            const dropdown = this.shadowRoot.querySelector("marble-dropdown");

            dropdown.click(async (data) => {
                switch (data.type) {
                    case "export":
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.getData()));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href", dataStr);
                        downloadAnchorNode.setAttribute("download",
                            "Attendance_" + this.date.getDate() + "/" + this.date.getMonth() + "/" + this.date.getFullYear() + ".json"
                        );
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                        dropdown.action();
                        break;
                    case "delete":
                        await (await fetch(config.baseURL + "/repa/delete", {
                            method: "POST",
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                            body: JSON.stringify({ date: this.date })
                        })).json();
                        this.removeCallback();
                        dropdown.action();
                        break;
                    default:
                        break;
                }
            });

            dropdown.setAttribute("options", JSON.stringify([
                {
                    type: "export",
                    text: "Export",
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M5.333 17.917q-.666 0-1.125-.459Q3.75 17 3.75 16.333V7.458q0-.312.125-.604t.354-.542l3.75-3.75q.25-.229.542-.354.291-.125.604-.125h5.542q.666 0 1.125.459.458.458.458 1.125v12.666q0 .667-.458 1.125-.459.459-1.125.459ZM10 13.5q.146 0 .292-.052t.27-.198l2.063-2.062q.187-.188.187-.459t-.187-.479q-.229-.208-.479-.198-.25.01-.458.198l-1.021 1.021V8.312q0-.27-.198-.468T10 7.646q-.271 0-.469.198-.198.198-.198.468v2.959L8.312 10.25q-.187-.188-.458-.188t-.458.188q-.229.229-.229.49 0 .26.229.448l2.042 2.062q.124.146.27.198.146.052.292.052Z"/></svg>`,
                },
                {
                    type: "import",
                    text: "Import",
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M9.458 11.146v2.792q0 .229.157.385.156.156.385.156t.385-.156q.157-.156.157-.385v-2.792l1.02 1.021q.063.062.178.104.114.041.208.041.094 0 .208-.031.115-.031.177-.114.188-.167.177-.386-.01-.219-.177-.385l-1.875-1.875q-.083-.104-.198-.146-.114-.042-.26-.042-.146 0-.26.042-.115.042-.198.146l-1.875 1.875q-.167.166-.167.375 0 .208.188.375.166.187.374.187.209 0 .376-.166ZM5.75 17.583q-.562 0-.948-.385-.385-.386-.385-.948V3.75q0-.562.385-.948.386-.385.948-.385h5.896q.271 0 .521.093.25.094.437.302l2.584 2.584q.208.187.302.437.093.25.093.521v9.896q0 .562-.385.948-.386.385-.948.385Zm5.667-11.666q0 .291.187.479.188.187.479.187H14.5L11.417 3.5Z"/></svg>`
                },
                {
                    type: "delete",
                    text: "Delete",
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M6.146 17.083q-.667 0-1.125-.458-.459-.458-.459-1.125V5.125h-.208q-.271 0-.469-.198-.197-.198-.197-.469 0-.27.197-.468.198-.198.469-.198h3.167q0-.313.239-.542.24-.229.552-.229h3.355q.312 0 .552.229.239.229.239.542h3.167q.271 0 .469.198.198.198.198.468 0 .271-.198.469-.198.198-.469.198h-.208V15.5q0 .667-.459 1.125-.458.458-1.125.458Zm1.625-3.75q0 .271.198.469.198.198.469.198.27 0 .468-.198t.198-.469V7.542q0-.271-.198-.469-.198-.198-.468-.198-.271 0-.469.198-.198.198-.198.469Zm3.083 0q0 .271.198.469.198.198.469.198.271 0 .469-.198.198-.198.198-.469V7.542q0-.271-.198-.469-.198-.198-.469-.198-.271 0-.469.198-.198.198-.198.469Z"/></svg>`,
                    color: "var(--error-color-1)"
                },
            ]));

            more.addEventListener("click", (event) => {
                if (event.target.localName !== "marble-dropdown") {
                    dropdown.action();
                }
            });

            const newRow = this.createRow();
            const data = this.getData();

            if (data.content.length == 0) {
                contentElement.appendChild(newRow.rowElement);
                newRow.description.addEventListener("keyup", this.newRow);
                newRow.time.addEventListener("keyup", this.newRow);
                newRow.type.addEventListener("keyup", this.newRow);
            }

            closeButton.addEventListener("keydown", (event) => { if (event.key === "Enter") { this.closeCallback() } });
            closeButton.addEventListener("click", () => this.closeCallback());
            saveButton.addEventListener("click", () => this.saveCallback());
            submitButton.addEventListener("click", () => this.submitCallback());

            schoolCheckbox.change(() => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { companyCheckbox.action() }
            });

            companyCheckbox.change(() => {
                if (schoolCheckbox.checked && companyCheckbox.checked) { schoolCheckbox.action() }
            });
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

    remove(callback) {this.removeCallback = callback }
    close(callback) { this.closeCallback = callback }
    submit(callback) { this.submitCallback = callback }
    save(callback) { this.saveCallback = callback }

    async setData(data) {
        await this.load;
        this.setAttribute("date", data.date);
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
        const saveButton = this.shadowRoot.querySelector(".save");
        const submitButton = this.shadowRoot.querySelector(".submit");
        const moreButton = this.shadowRoot.querySelector(".more");
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

                for (const row of content.children) {
                    const description = row.querySelector(".description");
                    const time = row.querySelector(".time");
                    const type = row.querySelector(".type");

                    description.disabled = newValue;
                    time.disabled = newValue;
                    type.disabled = newValue;
                }
                break;
            case "disablesave":
                newValue = JSON.parse(newValue);
                saveButton.disabled = newValue;
                break;
            case "disablesubmit":
                newValue = JSON.parse(newValue);
                submitButton.disabled = newValue;
                break;
            case "disablemore":
                newValue = JSON.parse(newValue);
                moreButton.disabled = newValue;
                break;
            default:
                break;
        }
    }
}