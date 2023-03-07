import BaseComponent from "../source/BaseComponent.js";

export default class Checkbox extends BaseComponent {

    static get observedAttributes() { return ["checked", "error"] }

    constructor() {
        super();
        this.addStyle("/style.css");
        this.addStyle("/components/Checkbox.css");
        this.useTemplate("/components/Checkbox.html");
        this.checked = false;

        this.connected(async () => {
            await this.load;
            const boxElement = this.shadowRoot.querySelector(".box");
            const checkElement = this.shadowRoot.querySelector(".check");

            this.action = (action) => {
                this.checked = action ? action : !this.checked;

                if (this.checked) {
                    checkElement.classList.add("visible");
                } else {
                    checkElement.classList.remove("visible");
                }
            }

            boxElement.addEventListener("keydown", (event) => {
                if (event.key === "Enter") { this.action() }
            })

            boxElement.addEventListener("click", () => {
                this.action();
            });
        })
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        switch (name) {
            case "checked":
                if (typeof newValue === "string") {
                    newValue = JSON.parse(newValue);
                }

                this.checked = newValue;

                this.action(this.checked);
                break;

            case "error":
                const boxElement = this.shadowRoot.querySelector(".box");

                if (typeof newValue === "string") {
                    newValue = JSON.parse(newValue);
                }

                if(newValue) {
                    boxElement.classList.add("error");
                }else {
                    boxElement.classList.remove("error");
                }
                break;

            default:
                break;
        }
    }
}