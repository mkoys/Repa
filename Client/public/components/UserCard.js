import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["username", "role", "avatar"] }

    constructor() {
        super();

        this.addStyle("/style.css");
        this.addStyle("/components/UserCard.css");
        this.useTemplate("/components/UserCard.html");
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;
        const avatar = this.shadowRoot.querySelector(".avatar");
        const username = this.shadowRoot.querySelector(".username");
        const role = this.shadowRoot.querySelector(".role");

        switch (name) {
            case "username":
                username.textContent = newValue;
                break;
            case "role":
                role.textContent = newValue;
                break;
            case "avatar":
                avatar.style.backgroundImage = `url('${newValue}')`;
                break;
            default:
                break;
        }
    }
}