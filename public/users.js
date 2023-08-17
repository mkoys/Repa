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
const userDropdownElement = document.querySelector(".userBoxDropdown");
const userMoreElement = document.querySelector(".userMoreIcon");
const userAdminDropdowns = document.querySelectorAll(".dropdownAdmin");
const logoutDropdownElement = document.querySelector(".logoutDropdown");
const attendanceDropdownElement = document.querySelector(".attendanceDropdown");
const usersDropdownElement = document.querySelector(".usersDropdown");

const token = localStorage.getItem("token");
if(!token) window.location = "/login.html";

let userDropdown = false;
let userDropdownLock = false;
let userDropdownTimeout = false;

logoutDropdownElement.addEventListener("click", () => {
	localStorage.removeItem("token");
	window.location.href = "/login.html";
});

attendanceDropdownElement.addEventListener("click", () => window.location.href = "/attendance.html");
usersDropdownElement.addEventListener("click", () => window.location.href = "/users.html");

userMoreElement.addEventListener("mouseenter", () => {
	setUserDropdown(true);
});

userMoreElement.addEventListener("mouseleave", () => {
	userDropdownTimeout = setTimeout(closeDropdown, 180)
});

function closeDropdown() {
	if(!userDropdownLock) {
		setUserDropdown(false);
	}
}

userDropdownElement.addEventListener("mouseenter", () => {
	userDropdownLock = true;
});

userDropdownElement.addEventListener("mouseleave", () => {
	userDropdownLock = false;
	clearTimeout(userDropdownTimeout);
	closeDropdown();
});


function setUserDropdown(setter) {
	if(setter === undefined) {
		userDropdown = !userDropdown;
	}else {
		userDropdown = setter;
	}

	if(userDropdown) {
		userMoreElement.style.opacity = 1;
		userDropdownElement.style.visibility = "visible";
		userDropdownElement.style.opacity = 1;
	}else {
		userMoreElement.style.opacity = null;
		userDropdownElement.style.visibility = null;
		userDropdownElement.style.opacity = 0;
	}
}

const userData = await fetch("/user", {headers: {Authorization: `token ${token}`}});
const userDataJson = await userData.json();
usernameElement.textContent = userDataJson.username;
const userAdmin = userDataJson.role === "admin";
if(userDataJson.role) roleElement.textContent = userDataJson.role;
if(userDataJson.avatar) avatarElement.style.backgroudImage = `url(${userDataJson.avatar})`;

async function getUsers(pageVisible, pageNumber) {
	const request = await fetch(`/users${pageVisible ? `?visible=${pageVisible}&page=${pageNumber}` : ""}`);
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
