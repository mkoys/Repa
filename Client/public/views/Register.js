import config from "../config.js";
import BaseComponent from "../source/BaseComponent.js";
import marble from "../marble.js";

export default class Register extends BaseComponent {
    constructor() {
        super();
        this.router = marble.router();

        this.addStyle("/style.css");
        this.addStyle("/views/Auth.css");
        this.useTemplate("/views/Register.html");

        this.connected(async () => {
            await this.load;

            const username = this.shadowRoot.querySelector(".username");
            const email = this.shadowRoot.querySelector(".email");
            const password = this.shadowRoot.querySelector(".password");
            const passwordRepeat = this.shadowRoot.querySelector(".repassword");

            const checkbox = this.shadowRoot.querySelector("marble-checkbox");

            const loading = this.shadowRoot.querySelector(".loading");
            const login = this.shadowRoot.querySelector(".login");
            const submit = this.shadowRoot.querySelector("marble-button");

            const inputs = { username, email, password, "re-password": passwordRepeat }

            login.addEventListener("click", (event) => {
                event.preventDefault();
                this.router.setRoute("login");
            });

            submit.addEventListener("click", async () => {
                checkbox.removeAttribute("error");
                this.setError(username);
                this.setError(email);
                this.setError(password);
                this.setError(passwordRepeat);

                loading.classList.add("load");

                const data = {
                    "username": username.getValue(),
                    "email": email.getValue(),
                    "password": password.getValue(),
                    "re-password": passwordRepeat.getValue(),
                }

                const response = await this.register(data);

                console.log(response);

                const error = checkError(response);

                loading.classList.remove("load");

                if (!error) {
                    username.clear();
                    email.clear();
                    password.clear();
                    passwordRepeat.clear();
                    
                    console.log("Registred in!");
                    this.router.setRoute("login");
                }
            })

            const checkError = (response) => {
                let error = false;

                if (!checkbox.checked) {
                    checkbox.setAttribute("error", "true");
                    error = true;
                }

                if (response.error) {
                    this.setError(username, response.error);
                    this.setError(email, response.error);
                    this.setError(password, response.error);
                    this.setError(passwordRepeat, response.error);
                    error = true;
                }

                if (response.errors) {
                    response.errors.forEach(error => {
                        const key = Object.keys(error)[0];
                        const value = Object.values(error)[0];
                        const element = inputs[key];

                        switch (value) {
                            case "required":
                                this.setError(element, "Required");
                                break;
                            case "or":
                                this.setError(element, "Required");
                                break;
                            case "min":
                                this.setError(element, "Too short");
                                break;
                            case "max":
                                this.setError(element, "Too long");
                                break;
                            case "match":
                                this.setError(element, "Not matching");
                                break;
                            case "duplicate":
                                this.setError(element, "Already taken");
                                break;
                            default:
                                break;
                        }
                    });
                    error = true;
                }
                return error;
            }
        });
    }

    async connectedCallback() {
        await this.load;
        const username = this.shadowRoot.querySelector(".username");
        const email = this.shadowRoot.querySelector(".email");
        const password = this.shadowRoot.querySelector(".password");
        const passwordRepeat = this.shadowRoot.querySelector(".repassword");

        this.setError(username);
        this.setError(email);
        this.setError(password);
        this.setError(passwordRepeat);
    }

    async register(data) {
        let result;
        try {
            result = await fetch(config.baseURL + "/auth/register", {
                method: "POST",
                body: JSON.stringify(data)
            });
        } catch (error) { return { error: "Server error" } }

        return await result.json();
    }

    setError(element, message) {
        if (message) {
            element.setAttribute("error", "true");
            element.setAttribute("message", message);
        } else {
            element.removeAttribute("error");
            element.removeAttribute("message");
        }
    }
}