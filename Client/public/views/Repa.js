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

        const cards = this.shadowRoot.querySelector(".cards");
        const calendar = this.shadowRoot.querySelector("marble-calendar");
        const mainElement = this.shadowRoot.querySelector(".main");
        const userInfoElement = this.shadowRoot.querySelector("marble-usercard");
        const userInfo = await this.getUserInfo();

        if (!localStorage.getItem("token") || userInfo.error) {
            localStorage.removeItem("token");
            this.router.setRoute("login");
        }

        userInfoElement.setAttribute("avatar", userInfo.avatar);
        userInfoElement.setAttribute("username", userInfo.username);
        userInfoElement.setAttribute("role", userInfo.role);

        if (userInfo.role.toLowerCase() === "admin") {
            const adminPanel = document.createElement("marble-admin");
            mainElement.appendChild(adminPanel);

            adminPanel.updateCallback = async (attendance, user) => {
                adminPanel.remove();

                const userPanel = document.createElement("marble-usercard");

                userPanel.setAttribute("undo", "true");
                userPanel.setAttribute("avatar", user.avatar);
                userPanel.setAttribute("username", user.username);
                userPanel.setAttribute("role", user .role);

                cards.insertBefore(userPanel, calendar);

                this.view = attendance;
                await this.updateData();
                this.createAttendance();

                userPanel.back(() => {
                    userPanel.remove();
                    calendar.setAttribute("visible", "false");
                    this.view = undefined;
                    mainElement.appendChild(adminPanel);
                })
            }
        } else {
            await this.updateData();
            this.createAttendance();
        }
    }

    async createAttendance() {
        const mainElement = this.shadowRoot.querySelector(".main");
        const calendar = this.shadowRoot.querySelector("marble-calendar");
        calendar.setAttribute("visible", "true");

        calendar.selectedUpdate((type, item) => {
            if (type === "opened") {
                if (!Array.isArray(item)) {
                    const foundDataIndex = this.userAttendance.findIndex(value => value.date.getTime() == item.date.getTime());
                    const newAttendance = document.createElement("marble-attendance");

                    if (foundDataIndex > -1) {
                        newAttendance.setData(this.userAttendance[foundDataIndex]);
                        if (this.userAttendance[foundDataIndex].submited) {
                            this.attendanceSubmited(newAttendance);
                        } else if (this.userAttendance[foundDataIndex].accepted) {
                            this.attendanceAccepted(newAttendance);
                        } else if (this.userAttendance[foundDataIndex].declined) {
                            this.attendanceDeclined(newAttendance);
                        } else {
                            this.attendanceSaved(newAttendance);
                        }
                    } else {
                        newAttendance.setAttribute("date", item.date);
                        newAttendance.setAttribute("disablesubmit", "true");
                    }

                    this.attendanceListeners(newAttendance, calendar, foundDataIndex);

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

    attendanceSaved(attendance) {
        attendance.setAttribute("statuscolor", "var(--text-color-1)");
        attendance.setAttribute("status", "Saved");
        attendance.setAttribute("disablesubmit", "true");
        attendance.removeAttribute("disablesubmit");
    }

    attendanceSubmited(attendance) {
        attendance.setAttribute("statuscolor", "var(--warning-color-1)");
        attendance.setAttribute("status", "Submited");
        attendance.setAttribute("disablesave", "true");
        attendance.setAttribute("disableinput", "true");
        attendance.setAttribute("disablesubmit", "true");
    }

    attendanceAccepted(attendance) {
        attendance.setAttribute("statuscolor", "var(--success-color-1)");
        attendance.setAttribute("status", "Accepted");
        attendance.setAttribute("disableinput", "true");
        attendance.setAttribute("disablesave", "true");
        attendance.setAttribute("disablesubmit", "true");
    }

    attendanceDeclined(attendance) {
        attendance.setAttribute("statuscolor", "var(--error-color-1)");
        attendance.setAttribute("status", "Declined");
        attendance.removeAttribute("disablesubmit")
    }

    async attendanceListeners(newAttendance, calendar, foundDataIndex) {
        newAttendance.close(() => calendar.selectDate(newAttendance.date));

        newAttendance.remove(async () => {
            newAttendance.setAttribute("disablesubmit", "true");
            newAttendance.setAttribute("status", "Unsaved");
            newAttendance.removeAttribute("statuscolor");
            newAttendance.removeAttribute("disableinput");
            newAttendance.removeAttribute("disablesave");
            newAttendance.setData({ content: [], where: null, date: new Date(newAttendance.getAttribute("date")) });
            await this.updateData();
        });

        newAttendance.save(async () => {
            if (foundDataIndex > -1 && this.userAttendance[foundDataIndex].submited) {
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
        if (typeof this.view !== "undefined") {
            const data = await (await fetch(config.baseURL + "/repa/attendance", {
                method: "POST",
                body: JSON.stringify({ id: this.view }),
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
            })).json();

            for (const attendance of data) {
                attendance.date = new Date(attendance.date);
            }

            return data;
        } else {

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