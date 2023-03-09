import BaseComponent from "../source/BaseComponent.js";

export default class Dropdown extends BaseComponent {

    static get observedAttributes() { return ["options", "left", "top", "height"] }

    constructor() {
        super();
        this.options = [];
        this.actionCallback = () => { }
        this.clickCallback = () => { };
        this.visible = true;
        this.addStyle("/style.css");
        this.addStyle("/components/Dropdown.css");
        this.useTemplate("/components/Dropdown.html");

        this.connected(async () => {
            await this.load;
            const shapeElement = this.shadowRoot.querySelector(".shape");
            const closeElement = this.shadowRoot.querySelector(".close");
            this.updateSize();

            closeElement.addEventListener("click", () => this.action());

            this.action = (action, reset) => {
                this.visible = typeof action !== "undefined" ? action : !this.visible;
                if (reset) {
                    closeElement.style.visibility = "hidden";
                    shapeElement.classList.remove("fadeIn");
                    shapeElement.classList.remove("fadeOut");
                    this.visible = true;
                } else {
                    if (this.visible) {
                        closeElement.style.visibility = "hidden";
                        shapeElement.classList.remove("fadeIn");
                        shapeElement.classList.add("fadeOut");
                    } else {
                        closeElement.style.visibility = "visible";
                        shapeElement.classList.remove("fadeOut");
                        shapeElement.classList.add("fadeIn");
                    }
                }

                if (this.active) { this.active.scrollIntoView(false)
    }
                this.actionCallback(this.visible);
            }
        });
    }

update(callback) { this.actionCallback = callback }
click(callback) { this.clickCallback = callback }

disconnectedCallback() {
    this.action(undefined, true);
}

    async updateSize() {
    await this.load;
    const closeElement = this.shadowRoot.querySelector(".close");
    const position = this.getPosition(closeElement);
    closeElement.style.top = `${-position.y}px`;
    closeElement.style.left = `${-position.x}px`;
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
        case "height":
            shapeElement.style.height = newValue + "px";
            break;
        case "options":
            shapeElement.innerHTML = "";
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

                optionBox.addEventListener("click", () => this.clickCallback(option));

                if (option.active) {
                    this.active = optionBox;
                    optionBox.classList.add("active");
                }

                if (option.icon) {
                    optionIcon = new DOMParser().parseFromString(option.icon, "text/html").body.children[0];
                    optionBox.appendChild(optionIcon);
                } else {
                    optionText.style.margin = "0px";
                    optionBox.style.justifyContent = "center";
                }

                if (option.color) {
                    optionText.style.color = option.color;
                    if (option.icon) {
                        optionIcon.style.fill = option.color;
                    }
                }

                shapeElement.append(optionBox);

                // if (optionIndex != this.options.length - 1) {
                //     const delimiter = document.createElement("div");
                //     delimiter.classList.add("delimiter");
                //     shapeElement.appendChild(delimiter);
                // }
            });
            break;

        default:
            break;
    }
}

getPosition(element) {
    var x = 0,
        y = 0;

    while (element) {
        x += (element.offsetLeft + element.clientLeft);
        y += (element.offsetTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x, y };
}
}