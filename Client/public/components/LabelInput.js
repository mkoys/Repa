import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["label", "type", "message", "error"] }

    constructor() {
        super();
        this.addStyle("/style.css");
        this.addStyle("/components/LabelInput.css");
        this.useTemplate("/components/LabelInput.html");

        this.getValue = () => {
            const inputElement = this.shadowRoot.querySelector("input");
            return inputElement.value;
        }

        this.connected(async () => {
            await this.load;
            const labelElement = this.shadowRoot.querySelector("label");
            const messageElement = this.shadowRoot.querySelector("p");
            const inputElement = this.shadowRoot.querySelector("input");

            this.clear = () => inputElement.value = "";

            inputElement.addEventListener("focusin", () => {
                labelElement.classList.add("focus");
                messageElement.classList.add("focus");
            });
            
            inputElement.addEventListener("focusout", () => {
                labelElement.classList.remove("focus");
                messageElement.classList.remove("focus");
            });
        });
    }


    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;

        switch (name) {
            case "label":
                const labelElement = this.shadowRoot.querySelector("label");
                labelElement.textContent = newValue;
                break;
            case "type":
                const inputElement = this.shadowRoot.querySelector("input");
                inputElement.setAttribute("type", newValue);
                break;
            case "message":
                const messageElement = this.shadowRoot.querySelector("p");
                messageElement.textContent = newValue ? "- " + newValue : null;
                break;
            case "error":
                const elements = {
                    label: this.shadowRoot.querySelector("label"),
                    message: this.shadowRoot.querySelector("p")
                };

                if(typeof newValue === "string") {
                    newValue = JSON.parse(newValue);
                }

                if(newValue) {
                    elements.message.classList.add("errorColor");
                    elements.label.classList.add("errorColor");
                }else {
                    elements.message.classList.remove("errorColor");
                    elements.label.classList.remove("errorColor");
                }
                break;

            default:
                break;
        }
    }
}