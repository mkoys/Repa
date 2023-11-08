import { setColor, setTheme } from "./setTheme.js";

const registerButton = document.querySelector(".authButton");
const loadingElement = document.querySelector(".loading");
const usernameElement = document.querySelector(".username");
const emailElement = document.querySelector(".email");
const passwordElement = document.querySelector(".password");
const rePasswordElement = document.querySelector(".rePassword");
const usernameError = document.querySelector(".usernameError");
const emailError = document.querySelector(".emailError");
const passwordError = document.querySelector(".passwordError");
const rePasswordError = document.querySelector(".rePasswordError");
const usernameLabel = document.querySelector("#usernameLabel");
const emailLabel = document.querySelector("#emailLabel");
const passwordLabel = document.querySelector("#passwordLabel");
const rePasswordLabel = document.querySelector("#rePasswordLabel");

// Check if user is logged in
const token = localStorage.getItem("token");
if(token) window.location = "/";

setTheme(localStorage.getItem("theme"));
setColor(localStorage.getItem("color"));

// On register action
registerButton.addEventListener("click", async () => {
	// Reset errors & loader
	setError();
	loadingElement.classList.add("load");

	const body = JSON.stringify({
		username: usernameElement.value,
		email: emailElement.value,
		password: passwordElement.value
	});

	// Login API request
	const response = await fetch("/register", {
		method: "POST",
		headers: { "Content-type": "application/json" },
		body
	});

	const jsonReponse = await response.json();

	console.log(jsonReponse)

	// Respose error check & parsing 
	if(jsonReponse.error) {
		const error = jsonReponse.error;
		switch(error.id)	{
			case 0:
				setError({ type: 0, value: " - Invalid input" });
				break;
			case 1:
				setError({ type: 0, value: " - Invalid type" });
				break;
			case 2:
				setError({ type: 0, value: " - Empty value" });
				break;
			case 3:
				setError({ type: 0, value: " - User already exists" });
				break;
			default: break;
		}

		// Remove loader
		loadingElement.classList.remove("load");
		return;
	}

	loadingElement.classList.remove("load");
	window.location = "/login.html";
});

// Sets errors in error elements
function setError(error) {
	if(!error) {
		usernameLabel.classList.remove("errorValue");
		passwordLabel.classList.remove("errorValue");
		usernameError.classList.remove("errorValue");
		passwordError.classList.remove("errorValue");
		usernameError.textContent = null;
		passwordError.textContent = null;
		return;
	}

	switch(error.type) {
		case 0:
			usernameLabel.classList.add("errorValue");
			passwordLabel.classList.add("errorValue");
			usernameError.classList.add("errorValue");
			passwordError.classList.add("errorValue");
			emailLabel.classList.add("errorValue");
			emailError.classList.add("errorValue");
			rePasswordLabel.classList.add("errorValue");
			rePasswordError.classList.add("errorValue");
			usernameError.textContent = error.value;
		break;
		case 1:
			usernameLabel.classList.add("errorValue");
			usernameError.classList.add("errorValue");
			usernameError.textContent = error.value;
		break;
		case 2:
			emailLabel.classList.add("errorValue");
			emailError.classList.add("errorValue");
			emailError.textContent = error.value;
		break;
		case 3:
			passwordLabel.classList.add("errorValue");
			passwordError.classList.add("errorValue");
			passwordError.textContent = error.value;
			break;
		case 4:
			rePasswordLabel.classList.add("errorValue");
			rePasswordError.classList.add("errorValue");
			rePasswordError.textContent = error.value;
		break;
		default: break;
	}
}
