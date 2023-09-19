const closeElement = document.querySelector(".close");
const roleElement = document.querySelector(".role");
const usernameElement = document.querySelector(".username");
const avatarElement = document.querySelector(".avatar");

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


