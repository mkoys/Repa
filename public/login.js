const loginButton = document.querySelector(".authButton");
const loadingElement = document.querySelector(".loading");
const usernameElement = document.querySelector(".username");
const passwordElement = document.querySelector(".password");
const usernameError = document.querySelector(".usernameError");
const passwordError = document.querySelector(".passwordError");
const usernameLabel = document.querySelector("#usernameLabel");
const passwordLabel = document.querySelector("#passwordLabel");

// Check if user is logged in
const token = localStorage.getItem("token");
if(token) window.location = "/";

// On login action
loginButton.addEventListener("click", async () => {
	// Reset errors & loader
	setError();
	loadingElement.classList.add("load");

	const body = JSON.stringify({
		email: usernameElement.value,
		password: passwordElement.value
	});
	
	// Login API request
	const response = await fetch("/login", {
		method: "POST",
		headers: { "Content-type": "application/json" },
		body
	});

	const jsonReponse = await response.json();

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
			case 4:
				setError({ type: 0, value: " - Invalid credentials" });
			break;
			default: break;
		}
		
		// Remove loader
		loadingElement.classList.remove("load");
		return;
	}

	// Save token & remove loader
	const token = jsonReponse.token;
	localStorage.setItem("token", token);
	loadingElement.classList.remove("load");
	window.location = "/";
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
			usernameError.textContent = error.value;
		break;
		case 1:
			usernameLabel.classList.add("errorValue");
			usernameError.classList.add("errorValue");
			usernameError.textContent = error.value;
		break;
		case 2:
			passwordLabel.classList.add("errorValue");
			passwordError.classList.add("errorValue");
			passwordError.textContent = error.value;
		break;
		default: break;
	}
}
