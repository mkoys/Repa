import BaseComponent from "../source/BaseComponent.js";

export default class Dropdown extends BaseComponent {

    static get observedAttributes() { return ["options"] }

    constructor() {
        super();
        this.options = [];
        this.addStyle("/style.css");
        this.addStyle("/components/Dropdown.css");
        this.useTemplate("/components/Dropdown.html");

        this.connected(async () => {
            console.log(this.attributes);
            await this.load;
        })
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        switch (name) {
            case "options":
                newValue = JSON.parse(newValue);
                this.options = newValue;
                const shapeElement = this.shadowRoot.querySelector(".shape");
                this.options.forEach(option => {
                    const optionBox = document.createElement("div");
                    const optionText = document.createElement("p");
                    let optionIcon;

                    optionText.textContent = option.text;

                    optionText.classList.add("optionText");
                    optionBox.classList.add("optionBox");
                    optionBox.appendChild(optionText);

                    if (option.icon) {
                        optionIcon = new DOMParser().parseFromString(option.icon, "text/html").body.children[0];
                        optionBox.appendChild(optionIcon);
                    }

                    if (option.color) {
                        optionText.style.color = option.color;
                        if (option.icon) {
                            optionIcon.style.fill = option.color;
                        }
                    }

                    shapeElement.append(optionBox);
                });
                break;

            default:
                break;
        }
    }
}