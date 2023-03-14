import config from "../config.js";
import marble from "../marble.js";
import BaseComponent from "../source/BaseComponent.js";

export default class Repa extends BaseComponent {
    constructor() {
        super();
        this.updateCallback = () => {}
        this.addStyle("/style.css");
        this.addStyle("/views/Admin.css");
        this.useTemplate("/views/Admin.html");

        this.connected(async () => {
            await this.load;
            const listElement = this.shadowRoot.querySelector(".list");
            const response = await (await fetch(config.baseURL + "/repa/users", { headers: { "Authorization": "Bearer " + localStorage.getItem("token") } })).json();
            for (const user of response.users) {
                const userComponent = document.createElement("marble-user");

                userComponent.setAttribute("username", user.username);
                userComponent.setAttribute("email", user.email);
                userComponent.setAttribute("role", user.role);
                userComponent.setAttribute("submited", user.submited);
                userComponent.setAttribute("accepted", user.accepted);
                userComponent.setAttribute("declined", user.declined);

                if (user.avatar && user.avatar !== "") {
                    userComponent.setAttribute("avatar", user.avatar);
                }

                if (user.role === "admin") {
                    userComponent.setAttribute("roleColor", "1");
                }

                userComponent.addEventListener("click", async () => {
                    this.updateCallback(user.id);
                });

                listElement.appendChild(userComponent);
            }
        });
    }
}