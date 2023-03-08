import marble from "./marble.js";

import LabelInput from "./components/LabelInput.js";
import Button from "./components/Button.js";
import Checkbox from "./components/Checkbox.js";

import Login from "./views/Login.js";
import Register from "./views/Register.js";

import UserCard from "./components/UserCard.js";
import Calendar from "./components/Calendar.js";
import Attendance from "./components/Attendance.js";

import Repa from "./views/Repa.js";

marble.init();

customElements.define("marble-label-input", LabelInput);
customElements.define("marble-button", Button);
customElements.define("marble-checkbox", Checkbox);

customElements.define("marble-login", Login);
customElements.define("marble-register", Register);

customElements.define("marble-usercard", UserCard);
customElements.define("marble-calendar", Calendar);
customElements.define("marble-attendance", Attendance);

customElements.define("marble-repa", Repa);

const router = marble.router();

router.addRoute("login", document.createElement("marble-login"));
router.addRoute("register", document.createElement("marble-register"));
router.addRoute("repa", document.createElement("marble-repa"));

const token = localStorage.getItem("token");

if(token) {
    router.setRoute("repa");
}else {
    router.setRoute("login");
}

const lightTheme = {
    '--main-color-1': '#c08efa',
    '--back-color-1': 'rgb(220, 220, 220)',
    '--back-color-2': 'rgb(255, 255, 255)',
    '--back-color-3': 'rgb(240, 240, 240)',
    '--text-color-1': '#000',
    '--text-color-2': '#212121',
    '--error-color-1': '#e35252'
}

const darkTheme = {
    '--main-color-1': '#8632e6',
    '--back-color-1': '#151515',
    '--back-color-2': 'rgb(14, 14, 14)',
    '--back-color-3': '#212121',
    '--text-color-1': 'white',
    '--text-color-2': 'rgb(200, 200, 200)',
    '--error-color-1': 'rgb(227, 82, 82)'
}

let currentTheme = darkTheme;

const themeKeys = Object.keys(currentTheme);
themeKeys.forEach(rule => {
    document.documentElement.style.setProperty(rule, currentTheme[rule]);
});
