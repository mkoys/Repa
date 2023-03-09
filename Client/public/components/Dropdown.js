import BaseComponent from "../source/BaseComponent.js";

export default class Dropdown extends BaseComponent {

    static get observedAttributes() { return ["options", "left", "top"] }

    constructor() {
        super();
        this.options = [];
        this.visible = true;
        this.addStyle("/style.css");
        this.addStyle("/components/Dropdown.css");
        this.useTemplate("/components/Dropdown.html");

        function getPosition(element) {
            var xPosition = 0,
                yPosition = 0;

            while (element) {
                xPosition += (element.offsetLeft + element.clientLeft);
                yPosition += (element.offsetTop + element.clientTop);
                element = element.offsetParent;
            }
            return {
                x: xPosition,
                y: yPosition
            };
        }

        this.connected(async () => {
            const shapeElement = this.shadowRoot.querySelector(".shape");
            const closeElement = this.shadowRoot.querySelector(".close");
            const position = getPosition(closeElement);
            closeElement.style.top = `${-position.y}px`;
            closeElement.style.left = `${-position.x}px`;

            closeElement.addEventListener("click", () => this.action());

            this.action = () => {
                this.visible = !this.visible;

                if (this.visible) {
                    closeElement.style.visibility = "hidden";
                    shapeElement.classList.remove("fadeIn")
                    shapeElement.classList.add("fadeOut")
                } else {
                    closeElement.style.visibility = "visible";
                    shapeElement.classList.remove("fadeOut")
                    shapeElement.classList.add("fadeIn")
                }
            }

            await this.load;
        })
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        const shapeElement = this.shadowRoot.querySelector(".shape");
        switch (name) {
            case "left":
                shapeElement.style.left = newValue + "px";
                break;
            case "top":
                shapeElement.style.top = newValue + "px";
                break;
            case "options":
                newValue = JSON.parse(newValue);
                this.options = newValue;
                this.options.forEach((option, optionIndex) => {
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

                    if (optionIndex != this.options.length - 1) {
                        const delimiter = document.createElement("div");
                        delimiter.classList.add("delimiter");
                        shapeElement.appendChild(delimiter);
                    }
                });
                break;

            default:
                break;
        }
    }
}