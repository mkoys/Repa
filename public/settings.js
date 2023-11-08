import { setColor, setTheme } from "./setTheme.js";

const closeElement = document.querySelector(".close");
const roleElement = document.querySelector(".role");
const usernameElement = document.querySelector(".username");
const avatarElement = document.querySelector(".avatar");

const themeNameElement = document.querySelector(".themeName");
const colorNameElement = document.querySelector(".colorName");

const systemColorsElement = document.querySelector(".system");
const darkColorsElement = document.querySelector(".dark");
const lightColorsElement = document.querySelector(".light");
const nightColorsElement = document.querySelector(".night");

let activeColor = document.querySelector(".active");

const currentTheme = localStorage.getItem("theme");
const currentColor = localStorage.getItem("color");

const colorElements = document.querySelectorAll(".color");
const colorElement = document.querySelector(`#${currentColor}`);

if(colorElement) {
	colorElement.classList.add("active");
	activeColor = colorElement;
	colorNameElement.textContent = capitalize(currentColor);
}

setColor(currentColor);
setTheme(currentTheme);

setThemeElement(currentTheme);

colorElements.forEach(element => {
	element.addEventListener("click", () => {
		const color = element.id;
		setColor(color);
		if(activeColor) activeColor.classList.remove("active");
		element.classList.add("active");
		activeColor = element;
		localStorage.setItem("color", color);
		colorNameElement.textContent = capitalize(color);
	});
});

lightColorsElement.addEventListener("click", () => {
	setTheme("light");
	setThemeElement("light");
	localStorage.setItem("theme", "light");
});

darkColorsElement.addEventListener("click", () => {
	setTheme("dark");
	setThemeElement("dark");
	localStorage.setItem("theme", "dark");
});

systemColorsElement.addEventListener("click", () => {
	setTheme("system");
	setThemeElement("system");
	localStorage.setItem("theme", "system");
});

nightColorsElement.addEventListener("click", () => {
	setTheme("night");
	setThemeElement("night");
	localStorage.setItem("theme", "night");
});

let backLink;

const token = localStorage.getItem("token");
if(!token) window.location = "/login.html";

for(let param of new URLSearchParams(window.location.search)) {
	if(param[0] === "back") backLink = param[1];
}

closeElement.addEventListener("click", _event => {
	window.location = backLink;
});

const userData = await fetch("/user", {headers: {Authorization: `token ${token}`}});
const userDataJson = await userData.json();
usernameElement.textContent = userDataJson.username;
const userAdmin = userDataJson.role === "admin";
if(userDataJson.role) roleElement.textContent = userDataJson.role;
if(userDataJson.avatar) avatarElement.style.backgroudImage = `url(${userDataJson.avatar})`;

function setThemeElement(theme) {
	themeNameElement.textContent = capitalize(theme);
	switch(theme) {
		case "light": {
			systemColorsElement.querySelector("svg").style.fill = null;
			darkColorsElement.querySelector("svg").style.fill = null;
			nightColorsElement.querySelector("svg").style.fill = null;
			lightColorsElement.querySelector("svg").style.fill = "var(--main-color)";
			} break;
		case "night": {
			systemColorsElement.querySelector("svg").style.fill = null;
			darkColorsElement.querySelector("svg").style.fill = null;
			nightColorsElement.querySelector("svg").style.fill = "var(--main-color)";
			lightColorsElement.querySelector("svg").style.fill = null;
			} break;
		case "system": {
			systemColorsElement.querySelector("svg").style.fill = "var(--main-color)";
			darkColorsElement.querySelector("svg").style.fill = null;
			nightColorsElement.querySelector("svg").style.fill = null;
			lightColorsElement.querySelector("svg").style.fill = null;
			} break;
		default: {
			darkColorsElement.querySelector("svg").style.fill = "var(--main-color)";
			systemColorsElement.querySelector("svg").style.fill = null;
			nightColorsElement.querySelector("svg").style.fill = null;
			lightColorsElement.querySelector("svg").style.fill = null;
			} break;
	}
}

function capitalize(str, lower = false) { return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase()) };
