import config from "../config.js";
import marble from "../marble.js";
import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["username", "role", "avatar"] }

    constructor() {
        super();
        this.router = marble.router();
        this.addStyle("/style.css");
        this.addStyle("/components/UserCard.css");
        this.useTemplate("/components/UserCard.html");

        this.connected(async () => {
            this.load;

            const more = this.shadowRoot.querySelector(".more");
            const dropdown = this.shadowRoot.querySelector("marble-dropdown");

            dropdown.setAttribute("options", JSON.stringify([
                {
                    type: "settings",
                    text: "Settings",
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M11.271 17.917H8.708q-.291 0-.51-.198-.219-.198-.26-.511l-.23-1.791q-.27-.125-.625-.334-.354-.208-.625-.395l-1.646.729q-.291.125-.572.021-.282-.105-.448-.376l-1.271-2.229q-.146-.271-.073-.552t.281-.469l1.417-1.083q-.021-.167-.031-.364-.011-.198-.011-.365 0-.146.011-.344.01-.198.031-.385L2.729 8.188Q2.521 8 2.448 7.719q-.073-.281.073-.552l1.271-2.209q.166-.25.448-.364.281-.115.552.01l1.666.708q.271-.187.615-.385t.635-.344l.23-1.791q.041-.313.26-.511t.51-.198h2.563q.312 0 .531.198.219.198.26.511l.23 1.791q.312.167.625.344.312.177.604.385l1.687-.708q.271-.125.552-.021.282.105.448.375L17.5 7.167q.146.271.083.552-.062.281-.291.469l-1.438 1.104q.021.187.021.364V10q0 .146-.01.333-.011.188-.011.396l1.417 1.083q.25.188.312.469.063.281-.104.552l-1.291 2.229q-.146.271-.428.365-.281.094-.572-.031l-1.667-.708q-.292.208-.615.395-.323.188-.614.334l-.23 1.791q-.041.313-.26.511t-.531.198Zm-1.313-5.355q1.063 0 1.813-.75t.75-1.812q0-1.062-.75-1.812t-1.813-.75q-1.041 0-1.802.75-.76.75-.76 1.812t.76 1.812q.761.75 1.802.75Z"/></svg>`
                },
                {
                    type: "logout",
                    text: "Logout",
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M6.562 13.438q.209.208.459.208t.458-.208L10 10.917l2.521 2.521q.187.187.458.187t.479-.187q.209-.23.198-.48-.01-.25-.218-.458l-2.5-2.5 2.52-2.521q.188-.187.188-.458t-.188-.479q-.229-.209-.479-.209-.25 0-.458.209L10 9.062 7.458 6.521q-.166-.167-.437-.167t-.459.188q-.208.208-.208.458t.208.458L9.083 10l-2.541 2.542q-.167.166-.167.437t.187.459ZM10 17.917q-1.646 0-3.094-.625t-2.51-1.688q-1.063-1.062-1.688-2.51-.625-1.448-.625-3.094t.625-3.094q.625-1.448 1.688-2.51 1.062-1.063 2.51-1.688Q8.354 2.083 10 2.083t3.094.625q1.448.625 2.51 1.688 1.063 1.062 1.688 2.51.625 1.448.625 3.094t-.625 3.094q-.625 1.448-1.688 2.51-1.062 1.063-2.51 1.688-1.448.625-3.094.625Z"/></svg>`,
                    color: "var(--error-color-1)"
                }
            ]));

            dropdown.click(async (data) => {
                switch (data.type) {
                    case "logout":
                        await this.logout();
                        localStorage.removeItem("token");
                        this.router.setRoute("login");
                        this.router.addRoute("repa", document.createElement("marble-repa"))
                        break;
                
                    default:
                        break;
                }
            });

            dropdown.update(event => {
                if (event) {
                    more.classList.remove("active");
                } else {
                    more.classList.add("active");
                }
            });

            more.addEventListener("click", () => {
                dropdown.action();
            });
        })
    }

    async logout() {
        return await (await fetch(config.baseURL + "/auth/logout", {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})).json();
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