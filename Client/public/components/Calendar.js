import BaseComponent from "../source/BaseComponent.js";

export default class LabelInput extends BaseComponent {

    static get observedAttributes() { return ["date"] }

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

            nextMonthElement.addEventListener("click", () => this.setMonth(1));
            previousMonthElement.addEventListener("click", () => this.setMonth(-1));

            this.updateDate();
        });
    }

    selectedUpdate(callback) {
        this.selectedUpdateCallback = callback;
    }

    setMonth(adder) {
        this.date.setMonth(this.date.getMonth() + adder);
        this.updateDate();
        this.selected = [];
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.load;

        switch (name) {
            case "date":
                this.date = new Date(newValue);
                this.updateDate();
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
            dateElement.classList.add("date");

            dateTextElement.textContent = date.getDate();

            if(this.checkIfCurrentDate(date)) {
                dateTextElement.classList.add("current");
            }

            if (disabled) {
                dateElement.classList.add("disabledDate");
            } else {
                this.days.push({ date, element: dateElement });
                dateElement.addEventListener("click", (event) => this.selectDate(date, dateElement, event));
            }

            dateElement.appendChild(dateTextElement);
            datesElement.appendChild(dateElement);
        }
    }

    selectDate(date, element, event) {
        const selected = this.selected.length ? true : false;
        const findFunction = (value) => value.date.getTime() == date.getTime();

        const daySelectedIndex = this.selected.findIndex(value => Array.isArray(value) ?
            value.findIndex(findFunction) > -1 : value.date.getTime() == date.getTime());

        const dayIndex = this.days.findIndex(value => value.date.getTime() == date.getTime());
        if (!event.shiftKey && this.range) {
            this.days[this.range].element.classList.remove("rangeBegin");
            this.range = false;
        }

        if (daySelectedIndex > -1) {
            this.selectedUpdateCallback("closed", this.selected[daySelectedIndex]);
            this.removeSelection(daySelectedIndex);
        } else if (this.range !== false && event.shiftKey) {
            if (this.range == dayIndex) {return this.range = false}

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
        } else if (event.shiftKey) {
            this.days[dayIndex].element.classList.add("rangeBegin");
            this.range = dayIndex;
        } else if (event.ctrlKey) {
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
        this.renderDate( selection[selection.length - 1].element);

        for (let index = 1; index < selection.length - 1; index++) {
            const item = selection[index];
            item.element.children[0].classList.add("range");
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
                item.element.children[0].classList.remove("range");
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
