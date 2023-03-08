import BaseComponent from "../source/BaseComponent.js";

export default class Checkbox extends BaseComponent {

    static get observedAttributes() { return ["checked", "error", "disable"] }

    constructor() {
        super();
        this.changeCallback = () => { };
        this.disabled = false;
        this.addStyle("/style.css");
        this.addStyle("/components/Checkbox.css");
        this.useTemplate("/components/Checkbox.html");
        this.checked = false;

        this.connected(async () => {
            await this.load;
            const boxElement = this.shadowRoot.querySelector(".box");
            const checkElement = this.shadowRoot.querySelector(".check");

            boxElement.addEventListener("keydown", (event) => {
                if (event.key === "Enter") { this.action() }
            })

            boxElement.addEventListener("click", () => {
                this.action();
            });
        })
    }

    change(callback) { this.changeCallback = callback }

    async action(action) {
        if (!this.disabled) {
            await this.load;
            const checkElement = this.shadowRoot.querySelector(".check");

            this.checked = action ? action : !this.checked;

            if (this.checked) {
                checkElement.classList.add("visible");
            } else {
                checkElement.classList.remove("visible");
            }

            this.changeCallback(this.checked);
        }
    }
    
    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        const boxElement = this.shadowRoot.querySelector(".box");
        switch (name) {
            case "checked":
                if (typeof newValue === "string") {
                    newValue = JSON.parse(newValue);
                }

                this.checked = newValue;

                this.action(this.checked);
                break;

            case "error":
                if (typeof newValue === "string") {
                    newValue = JSON.parse(newValue);
                }

                if (newValue) {
                    boxElement.classList.add("error");
                } else {
                    boxElement.classList.remove("error");
                }
                break;
            case "disable":
                newValue = JSON.parse(newValue);

                if(newValue) {
                    boxElement.classList.add("disabled");
                }else {
                    boxElement.classList.remove("disabled");
                }

                this.disabled = newValue;

                break;
            default:
                break;
        }
    }
}