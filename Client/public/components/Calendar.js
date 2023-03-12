import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["date", "visible"] }

    constructor() {
        super();

        this.monthList = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "Septempber",
            "October",
            "November",
            "December"
        ]

        this.date = new Date();
        this.selected = [];
        this.days = [];
        this.range = false;
        this.selectedUpdateCallback = () => { };
        this.addStyle("/style.css");
        this.addStyle("/components/Calendar.css");
        this.useTemplate("/components/Calendar.html");

        this.connected(async () => {
            await this.load;
            const nextMonthElement = this.shadowRoot.querySelector(".nextMonth");
            const previousMonthElement = this.shadowRoot.querySelector(".previousMonth");
            const dateDropdown = this.shadowRoot.querySelector(".dateDropdown");
            const dropdown = this.shadowRoot.querySelector("marble-dropdown");
            this.updateDropdown();

            dropdown.click(async (data) => {
                this.date.setFullYear(parseInt(data.text));
                this.updateDate();
                while (this.selected.length) {
                    this.selectedUpdateCallback("closed", this.selected[0]);
                    this.removeSelection(0);
                }
                this.setData(this.data);
                this.updateDropdown();
                dropdown.action();
            });

            dropdown.update(event => {
                if (event) {
                    dateDropdown.classList.add("downAnim");
                    dateDropdown.classList.remove("upAnim");
                } else {
                    dateDropdown.classList.add("upAnim");
                    dateDropdown.classList.remove("downAnim");
                }
            });

            dateDropdown.addEventListener("click", () => {
                dropdown.action();
            });

            nextMonthElement.addEventListener("click", () => this.setMonth(1));
            previousMonthElement.addEventListener("click", () => this.setMonth(-1));

            this.updateDate();
        });
    }

    setData(data) {
        this.data = data;
        data.forEach(item => {
            const foundIndex = this.days.findIndex(value => value.date.getTime() == item.date.getTime());
            if (foundIndex > -1) {
                const element = this.days[foundIndex].element;
                const ballElement = element.querySelector(".ball");
                if (item.submited) {
                    ballElement.classList.add("submited");
                } else if (item.accepted) {
                    ballElement.classList.add("accepted");
                } else if (item.declined) {
                    ballElement.classList.add("declined");
                } else {
                    ballElement.classList.add("saved");
                }
            }
        });
    }

    selectedUpdate(callback) {
        this.selectedUpdateCallback = callback;
    }

    setMonth(adder) {
        this.date.setMonth(this.date.getMonth() + adder);
        this.updateDate();

        while (this.selected.length) {
            this.selectedUpdateCallback("closed", this.selected[0]);
            this.removeSelection(0);
        }

        this.setData(this.data);
        this.updateDropdown();
    }

    updateDropdown() {
        const dropdown = this.shadowRoot.querySelector("marble-dropdown");

        let years = [];

        for (let index = -4; index < 5; index++) {
            const year = this.date.getFullYear() + index;
            let data = { type: year, text: year };

            if (index == 0) {
                data["active"] = true;
            }

            years.push(data);
        }

        dropdown.setAttribute("options", JSON.stringify(years));
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;

        switch (name) {
            case "date":
                this.date = new Date(newValue);
                this.updateDate();
                break;
            case "visible":
                newValue = JSON.parse(newValue);
                if (newValue) {
                    this.shadowRoot.host.style.display = "flex";
                } else {
                    this.shadowRoot.host.style.display = "none";
                }
                break;

            default:
                break;
        }
    }

    updateDate() {
        const currentYear = this.date.getFullYear();
        const currentMonth = this.date.getMonth();

        const dateTextElement = this.shadowRoot.querySelector(".dateText");
        const datesElement = this.shadowRoot.querySelector(".dates");

        datesElement.innerHTML = "";
        this.days = [];

        const daysInPreviousMonth = this.getAllDaysInMonth(currentYear, currentMonth - 1);
        const daysInMonth = this.getAllDaysInMonth(currentYear, currentMonth);
        const daysInNextMonth = this.getAllDaysInMonth(currentYear, currentMonth + 1);

        const firstDayOfMonth = daysInMonth[0].getDay();

        let previousDays = [];

        if (firstDayOfMonth > 0) {
            previousDays = daysInPreviousMonth.reverse().slice(0, firstDayOfMonth - 1).reverse();
        }

        const nextDays = daysInNextMonth.slice(0, 42 - (daysInMonth.length + previousDays.length));

        dateTextElement.textContent = `${this.monthList[this.date.getMonth()]} ${this.date.getFullYear()}`;

        this.addDates(previousDays, true);
        this.addDates(daysInMonth, false);
        this.addDates(nextDays, true);
    }

    addDates(dates, disabled) {
        const datesElement = this.shadowRoot.querySelector(".dates");

        for (const date of dates) {
            const dateElement = document.createElement("div");
            const dateTextElement = document.createElement("p");
            const ballElement = document.createElement("div");

            dateElement.classList.add("date");
            ballElement.classList.add("ball");

            dateTextElement.textContent = date.getDate();

            if (this.checkIfCurrentDate(date)) {
                dateTextElement.classList.add("current");
            }

            if (disabled) {
                dateElement.classList.add("disabledDate");
            } else {
                dateElement.addEventListener("click", (event) => this.selectDate(date, event.shiftKey, event.ctrlKey));
            }

            this.days.push({ date, element: dateElement });


            dateElement.appendChild(dateTextElement);
            dateElement.appendChild(ballElement);
            datesElement.appendChild(dateElement);
        }
    }

    selectDate(date, shiftKey = false, ctrlKey = false) {
        const element = this.days[this.days.findIndex(item => item.date.getTime() == date.getTime())].element;
        const selected = this.selected.length ? true : false;
        const findFunction = (value) => value.date.getTime() == date.getTime();

        const daySelectedIndex = this.selected.findIndex(value => Array.isArray(value) ?
            value.findIndex(findFunction) > -1 : value.date.getTime() == date.getTime());

        const dayIndex = this.days.findIndex(value => value.date.getTime() == date.getTime());
        if (!shiftKey && this.range) {
            this.days[this.range].element.classList.remove("rangeBegin");
            this.range = false;
        }

        if (daySelectedIndex > -1) {
            this.selectedUpdateCallback("closed", this.selected[daySelectedIndex]);
            this.removeSelection(daySelectedIndex);
        } else if (this.range !== false && shiftKey) {
            if (this.range == dayIndex) { return this.range = false }

            const start = this.range > dayIndex ? dayIndex : this.range;
            const end = this.range > dayIndex ? this.range : dayIndex;
            const rangeSelection = this.days.slice(start, end + 1);

            for (let index = 0; index < rangeSelection.length; index++) {
                const item = rangeSelection[index];
                const isSelected = this.selected.findIndex(value => Array.isArray(value) ?
                    value.findIndex((value) => value.date.getTime() == item.date.getTime()) > -1 :
                    value.date.getTime() == item.date.getTime()
                );

                if (isSelected > -1) {
                    this.selectedUpdateCallback("closed", this.selected[isSelected]);
                    this.removeSelection(isSelected);
                }
            }

            this.renderRange(rangeSelection);
            this.selected.push(rangeSelection);
            this.selectedUpdateCallback("opened", rangeSelection);
            this.range = false;
        } else if (shiftKey) {
            this.days[dayIndex].element.classList.add("rangeBegin");
            this.range = dayIndex;
        } else if (ctrlKey) {
            this.renderDate(element);
            this.selected.push(this.days[dayIndex]);
            this.selectedUpdateCallback("opened", this.days[dayIndex]);
        } else if (!selected) {
            this.renderDate(element);
            this.selected.push(this.days[dayIndex]);
            this.selectedUpdateCallback("opened", this.days[dayIndex]);
        } else {
            while (this.selected.length) {
                this.selectedUpdateCallback("closed", this.selected[0]);
                this.removeSelection(0);
            }

            this.renderDate(element);
            this.selected.push(this.days[dayIndex]);
            this.selectedUpdateCallback("opened", this.days[dayIndex]);
        }

    }

    renderDate(selected) {
        selected.children[0].classList.add("selected");
    }

    renderRange(selection) {
        this.days[this.range].element.classList.remove("rangeBegin");

        selection[0].element.classList.add("rangeStart");
        selection[selection.length - 1].element.classList.add("rangeEnd");
        this.renderDate(selection[0].element);
        this.renderDate(selection[selection.length - 1].element);

        for (let index = 1; index < selection.length - 1; index++) {
            const item = selection[index];
            item.element.classList.add("range");
        }
    }

    removeSelection(index) {
        if (Array.isArray(this.selected[index])) {
            this.selected[index][0].element.classList.remove("rangeStart");
            this.selected[index][this.selected[index].length - 1].element.classList.remove("rangeEnd");
            this.selected[index][0].element.children[0].classList.remove("selected");
            this.selected[index][this.selected[index].length - 1].element.children[0].classList.remove("selected");

            for (let innerIndex = 1; innerIndex < this.selected[index].length - 1; innerIndex++) {
                const item = this.selected[index][innerIndex];
                item.element.classList.remove("range");
            }

            this.selected.splice(index, 1);
        } else {
            this.selected[index].element.children[0].classList.remove("selected");
            this.selected.splice(index, 1);
        }
    }

    checkIfCurrentDate = (date) => {
        if (
            date.getDate() === new Date().getDate() &&
            date.getFullYear() === new Date().getFullYear() &&
            date.getMonth() === new Date().getMonth()
        ) {
            return true;
        } else {
            return false;
        }
    }

    getAllDaysInMonth(year, month) {
        const date = new Date(year, month, 1);

        const dates = [];

        while (date.getMonth() === month) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return dates;
    }
}
