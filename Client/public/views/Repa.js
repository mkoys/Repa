import config from "../config.js";
import BaseComponent from "../source/BaseComponent.js";
import marble from "../marble.js";

export default class Repa extends BaseComponent {
    constructor() {
        super();
        this.router = marble.router();
        this.token = localStorage.getItem("token");

        this.addStyle("/style.css");
        this.addStyle("/views/Repa.css");
        this.useTemplate("/views/Repa.html");
    }

    async connectedCallback() {
        await this.load;
        const attendance = this.shadowRoot.querySelector("marble-attendance");
        const calendar = this.shadowRoot.querySelector("marble-calendar");
        const userInfoElement = this.shadowRoot.querySelector("marble-usercard");
        const userInfo = await this.getUserInfo();
        
        userInfoElement.setAttribute("avatar", userInfo.avatar);
        userInfoElement.setAttribute("username", userInfo.username);
        userInfoElement.setAttribute("role", userInfo.role);
        
        calendar.selectedUpdate((type, item) => {
            if(Array.isArray(item)) {
                console.log(type, item);
            }else {
                console.log(type, new Date(item.date).getDate());
            }
        });
    }

    async getUserInfo() {
        const token = localStorage.getItem("token");
        const response = await fetch(config.baseURL + "/repa/me", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        return data;
    }
}