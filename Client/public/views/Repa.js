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

        this.updateData();

        userInfoElement.setAttribute("avatar", userInfo.avatar);
        userInfoElement.setAttribute("username", userInfo.username);
        userInfoElement.setAttribute("role", userInfo.role);

        calendar.selectedUpdate((type, item) => {
            if (type === "opened") {
                if (!Array.isArray(item)) {
                    const foundDataIndex = this.userAttendance.findIndex(value => value.date.getTime() == item.date.getTime());
                    const newAttendance = document.createElement("marble-attendance");

                    if (foundDataIndex > -1) {
                        newAttendance.setData(this.userAttendance[foundDataIndex]);
                        if(this.userAttendance[foundDataIndex].submited) {
                            newAttendance.setAttribute("statuscolor", "var(--warning-color-1)");
                            newAttendance.setAttribute("status", "Submited");
                            newAttendance.setAttribute("disablesave", "true");
                            newAttendance.setAttribute("disableinput", "true");
                            newAttendance.setAttribute("disablesubmit", "true");
                        }else if(this.userAttendance[foundDataIndex].accepted) {
                            newAttendance.setAttribute("statuscolor", "var(--success-color-1)");
                            newAttendance.setAttribute("status", "Accepted");
                            newAttendance.setAttribute("disableinput", "true");
                            newAttendance.setAttribute("disablesave", "true");
                            newAttendance.setAttribute("disablesubmit", "true");
                        }else if(this.userAttendance[foundDataIndex].declined) {
                            newAttendance.setAttribute("statuscolor", "var(--error-color-1)");
                            newAttendance.setAttribute("status", "Declined");
                            newAttendance.removeAttribute("disablesubmit");
                        }else {
                            newAttendance.setAttribute("statuscolor", "var(--text-color-1)");
                            newAttendance.setAttribute("status", "Saved");
                            newAttendance.setAttribute("disablesubmit", "true");
                            newAttendance.removeAttribute("disablesubmit");
                        }
                    } else {
                        newAttendance.setAttribute("date", item.date);
                        newAttendance.setAttribute("disablesubmit", "true");
                    }

                    newAttendance.close(() => calendar.selectDate(newAttendance.date));

                    newAttendance.save(async () => {
                        if(foundDataIndex > -1 && this.userAttendance[foundDataIndex].submited) {
                            return;
                        } 
                        const data = newAttendance.getData();
                        newAttendance.setAttribute("loading", "true");
                        newAttendance.setAttribute("statuscolor", "var(--text-color-1)");
                        newAttendance.setAttribute("status", "Saving...");
                        newAttendance.setAttribute("disableinput", "true");
                        newAttendance.setAttribute("disablesave", "true");
                        newAttendance.setAttribute("disablesubmit", "true");
                        newAttendance.setAttribute("disablemore", "true");
                        const result = await this.saveData(data);
                        newAttendance.removeAttribute("loading");
                        newAttendance.removeAttribute("disableinput");
                        newAttendance.removeAttribute("disablesave", "true");
                        newAttendance.removeAttribute("disablesubmit", "true");
                        newAttendance.removeAttribute("disablemore", "true");
                        
                        if (!result.error) {
                            newAttendance.setAttribute("status", "Saved")
                            this.updateData();
                        }
                    });
                    
                    newAttendance.submit(async () => {
                        const data = newAttendance.getData();
                        newAttendance.setAttribute("loading", "true");
                        newAttendance.setAttribute("statuscolor", "var(--warning-color-1)");
                        newAttendance.setAttribute("status", "Submiting...");
                        newAttendance.setAttribute("disableinput", "true");
                        newAttendance.setAttribute("disablesave", "true");
                        newAttendance.setAttribute("disablesubmit", "true");
                        newAttendance.setAttribute("disablemore", "true");
                        const result = await this.submitData(data);
                        newAttendance.removeAttribute("loading");
                        newAttendance.removeAttribute("disablemore", "true");

                        if (!result.error) {
                            newAttendance.setAttribute("status", "Submited");
                            this.updateData();
                        }
                    });

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

    async updateData() {
        const calendar = this.shadowRoot.querySelector("marble-calendar");
        this.userAttendance = await this.getAttendance();
        calendar.setData(this.userAttendance);
    }

    async submitData(data) {
        data.submited = true;
        const response = await fetch(config.baseURL + "/repa/save", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        return await response.json();
    }

    async saveData(data) {
        const response = await fetch(config.baseURL + "/repa/save", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        console.log(JSON.parse(JSON.stringify(data)));

        return await response.json();

        // return await new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve({ message: "ok" });
        //     }, 2000);
        // })
    }

    async getAttendance() {
        const token = localStorage.getItem("token");
        const response = await fetch(config.baseURL + "/repa/attendance", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        for (const item of data) {
            item.date = new Date(item.date);
        }

        return data;
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