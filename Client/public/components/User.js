import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["username", "avatar", "class", "role", "rolecolor"] }

    constructor() {
        super();

        this.addStyle("/style.css");
        this.addStyle("/components/User.css");
        this.useTemplate("/components/User.html");
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        const usernameElement = this.shadowRoot.querySelector(".username");
        const avatarElement = this.shadowRoot.querySelector(".avatar");
        const classDetailsElement = this.shadowRoot.querySelector(".classDetails");
        const classElement = this.shadowRoot.querySelector(".class");
        const roleDetailsElement = this.shadowRoot.querySelector(".roleDetails");
        const roleElement = this.shadowRoot.querySelector(".role");

        switch (name) {
            case "username":
                usernameElement.textContent = newValue;
                break;
            case "avatar":
                avatarElement.style.backgroundImage = `url(${newValue})`;
                break;
            case "class":
                if (newValue) {
                    console.log(1);
                    classDetailsElement.style.visibility = "visible";
                    classElement.textContent = newValue;
                } else {
                    classDetailsElement.style.visibility = "hidden";
                    classElement.textContent = "";
                }
                break;
            case "role":
                roleElement.textContent = newValue;
                break;
                case "rolecolor":
                    switch (parseInt(newValue)) {
                        case 1:
                            roleDetailsElement.style.backgroundColor = "var(--success-color-lower-1)";
                            roleElement.style.color = "var(--success-color-1)";
                            break;
                    
                        default:
                            roleDetailsElement.style.backgroundColor = "var(--main-color-lower-1)";
                            roleElement.style.color = "var(--main-color-1)";
                            break;
                    }
                    break;
            default:
                break;
        }
    }
}