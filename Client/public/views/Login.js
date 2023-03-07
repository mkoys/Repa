import config from "../config.js";
import BaseComponent from "../source/BaseComponent.js";
import marble from "../marble.js";

export default class Login extends BaseComponent {
    constructor() {
        super();
        this.router = marble.router();

        this.addStyle("/style.css");
        this.addStyle("/views/Auth.css");
        this.useTemplate("/views/Login.html");

        this.connected(async () => {
            await this.load;

            const username = this.shadowRoot.querySelector(".username");
            const password = this.shadowRoot.querySelector(".password");

            const loading = this.shadowRoot.querySelector(".loading");
            const register = this.shadowRoot.querySelector(".register");
            const submit = this.shadowRoot.querySelector("marble-button");

            const inputs = { username, password }

            register.addEventListener("click", (event) => {
                event.preventDefault();
                this.router.setRoute("register");
            });

            submit.addEventListener("click", async () => {
                this.setError(username);
                this.setError(password);

                loading.classList.add("load");

                const data = {
                    username: username.getValue(),
                    password: password.getValue(),
                }

                const response = await this.login(data);

                const error = checkError(response);

                loading.classList.remove("load");

                if (!error) {
                    localStorage.setItem("token", response.token)
                    console.log("Logged in!");
                    this.router.setRoute("repa");
                }
            });

            const checkError = (response) => {
                let error = false;

                if (response.error) {
                    this.setError(username, response.error);
                    this.setError(password, response.error);
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
                            case "auth":
                                this.setError(username, "Invalid credentials");
                                this.setError(password, "Invalid credentials");
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
        const password = this.shadowRoot.querySelector(".password");

        this.setError(username);
        this.setError(password);
    }

    async login(data) {
        let result;
        try {
            result = await fetch(config.baseURL + "/auth/login", {
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