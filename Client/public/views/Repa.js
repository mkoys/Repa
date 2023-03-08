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
        const mainElement = this.shadowRoot.querySelector(".main");
        const calendar = this.shadowRoot.querySelector("marble-calendar");
        const userInfoElement = this.shadowRoot.querySelector("marble-usercard");
        const userInfo = await this.getUserInfo();

        // attendance.save(async () => {
        //     const data = attendance.getData();

        //     console.log(data);

        //     const response = await fetch(config.baseURL + "/repa/save", {
        //         method: "POST",
        //         body: JSON.stringify(data),
        //         headers: {
        //             "Content-type": "application/json",
        //             "Authorization": "Bearer " + localStorage.getItem("token")
        //         }
        //     });

        //     const result = await response.json();

        //     console.log(result);
        // });

        userInfoElement.setAttribute("avatar", userInfo.avatar);
        userInfoElement.setAttribute("username", userInfo.username);
        userInfoElement.setAttribute("role", userInfo.role);

        calendar.selectedUpdate((type, item) => {
            if (type === "opened") {
                if (!Array.isArray(item)) {
                    const newAttendance = document.createElement("marble-attendance");
                    newAttendance.setAttribute("date", item.date);
                    mainElement.appendChild(newAttendance);
                }
            }

            if (type === "closed") {
                if (!Array.isArray(item)) {
                    for (const child of mainElement.children) {
                        if (child.date.getTime() == item.date.getTime()) {
                            mainElement.removeChild(child);
                        }
                    }
                }
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