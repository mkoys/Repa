let pageVisible = 5;
let pageNumber = 0;

const userTemplateElement = document.querySelector(".user");
const userListElement = document.querySelector(".userListContentList");
const pageNumberElement = document.querySelector(".pageNumber");
const pageLengthElement = document.querySelector(".pageLength");
const pageVisibleElement = document.querySelector(".pagesVisible");
const roleElement = document.querySelector(".role");
const usernameElement = document.querySelector(".username");
const avatarElement = document.querySelector(".avatar");

const token = localStorage.getItem("token");
if(!token) window.location = "/login.html";

const userData = await fetch("/user", {headers: {Authorization: `token ${token}`}});
const userDataJson = await userData.json();
usernameElement.textContent = userDataJson.username;
const userAdmin = userDataJson.role === "admin";
if(userDataJson.role) roleElement.textContent = userDataJson.role;
if(userDataJson.avatar) avatarElement.style.backgroudImage = `url(${userDataJson.avatar})`;

async function getUsers(pageVisible, pageNumber) {
	const request = await fetch("/users");
	const requestJson = await request.json();
	return requestJson;
}

const userList = await getUsers(pageVisible, pageNumber);

pageNumberElement.textContent = pageNumber + 1;
pageVisibleElement.textContent = pageVisible;
pageLengthElement.textContent = userList.pageLength;

userList.page.forEach(user => {
	const userCloneElement = userTemplateElement.content.cloneNode(true);
	const userElement = userCloneElement.querySelector(".userContainer");
	const userAvatar = userElement.querySelector(".userAvatar");
	const userName = userElement.querySelector(".userUsernameText");
	const userEmail = userElement.querySelector(".userEmailText");
	const userClassElement = userElement.querySelector(".userClass");
	const userClass = userElement.querySelector(".userClassText");
	const userRoleElement = userElement.querySelector(".userRole");
	const userRole = userElement.querySelector(".userRoleText");
	const userCalendar = userElement.querySelector(".userActionCalendar");

	userCalendar.addEventListener("click", _event => {
		window.location = `/attendance.html?id=${user.id}&username=${user.username}&role=${user.role}`;
	});

	if(user.avatar) userAvatar.style.backgroundImage = `url(${user.avatar})`;

	userName.textContent = user.username;
	userEmail.textContent = user.email;

	if(user.class) {
		userClassElement.style.display = "flex";
		userClass.textContent = user.class;
	}

	if(user.role) {
		userRoleElement.style.display = "flex";
		userRole.textContent = user.role;
	}

  userListElement.appendChild(userElement);
});
