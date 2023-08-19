let pageVisible = 5;
let pageNumber = 0;
let selectedUsers = [];

const userTemplateElement = document.querySelector(".user");
const userListElement = document.querySelector(".userListContentList");
const pageNumberElement = document.querySelector(".pageNumber");
const pageLengthElement = document.querySelector(".pageLength");
const pageVisibleElement = document.querySelector(".pagesVisible");
const addUserElement = document.querySelector(".actionAddUser");
const roleElement = document.querySelector(".role");
const usernameElement = document.querySelector(".username");
const avatarElement = document.querySelector(".avatar");
const userDropdownElement = document.querySelector(".userBoxDropdown");
const userMoreElement = document.querySelector(".userMoreIcon");
const userAdminDropdowns = document.querySelectorAll(".dropdownAdmin");
const logoutDropdownElement = document.querySelector(".logoutDropdown");
const attendanceDropdownElement = document.querySelector(".attendanceDropdown");
const usersDropdownElement = document.querySelector(".usersDropdown");
const pagingForward = document.querySelector(".pagingForward");
const pagingBackward = document.querySelector(".pagingBack");
const sortActionElement = document.querySelector(".actionSort");
const sortActionDropdown = document.querySelector(".sortDropdown"); 
const sortActionItems = document.querySelectorAll(".sortDropdownItem");
const sortActionIcon = document.querySelector(".actionSortIcon");
const sortActionText = document.querySelector(".actionSortText");
const userCountElement = document.querySelector(".userListHeaderSpan");
const loadingElement = document.querySelector(".loading");
const popupElement = document.querySelector(".popup");
const popupNewUser = document.querySelector(".newUser");
const cancelNewUser = document.querySelector(".cancelNewUser");


cancelNewUser.addEventListener("click", _event => {
	popupElement.style.opacity = null;
	popupElement.style.visibility = null; 
	popupNewUser.style.display = null;
}); 

addUserElement.addEventListener("click", _event => {
	popupElement.style.opacity = 1;
	popupElement.style.visibility = "visible";
	popupNewUser.style.display = "flex";
});

pagingForward.addEventListener("click", async () => {
	loadingElement.classList.add("load");
	const userList = await getUsers(pageVisible, pageNumber);
	if(pageNumber < userList.pageLength -1) {
		pageNumber++;
		const userList = await getUsers(pageVisible, pageNumber);

		pageNumberElement.textContent = pageNumber + 1;
		pageVisibleElement.textContent = pageVisible;
		pageLengthElement.textContent = userList.pageLength;

		renderUserList(userList);
	}
	loadingElement.classList.remove("load");
});

let sortItem = null;
let sort = false;

sortActionItems.forEach(element => {
	element.addEventListener("click", async _event => {
		loadingElement.classList.add("load");
		const value = element.querySelector(".sortDropdownText").textContent;
		const box = element.querySelector(".sortDropdownBox");

		if(box.style.opacity) {
			box.style.opacity = null;
			sort = false;
		}else {
			if(sortItem) {
				const oldBox = sortItem.querySelector(".sortDropdownBox");
				oldBox.style.opacity = null;
			}
			box.style.opacity = 1;
			sortItem = element;
			sort = value;
		}


		const userList = await getUsers(pageVisible, pageNumber);
		renderUserList(userList);
		loadingElement.classList.remove("load");
	});
});

sortActionElement.addEventListener("click", _event => {
	if(sortActionDropdown.style.display) {
		sortActionDropdown.style.display = null;
		sortActionText.style.color = null;
		sortActionIcon.style.fill = null;
	}else {
		sortActionDropdown.style.display = "flex";
		sortActionText.style.color = "var(--text-color)";
		sortActionIcon.style.fill = "var(--text-color)";
	}
});

pagingBackward.addEventListener("click", async () => {
	loadingElement.classList.add("load");
	const userList = await getUsers(pageVisible, pageNumber);
	if(pageNumber > 0) {
		pageNumber--;
		const userList = await getUsers(pageVisible, pageNumber);

		pageNumberElement.textContent = pageNumber + 1;
		pageVisibleElement.textContent = pageVisible;
		pageLengthElement.textContent = userList.pageLength;

		renderUserList(userList);
	loadingElement.classList.remove("load");
	}
});

pageVisibleElement.addEventListener("keydown", async event => {
	if(event.key === "Escape") {
		pageVisibleElement.blur();
		pageNumberElement.textContent = pageNumber + 1;
		pageVisibleElement.textContent = pageVisible;
		pageLengthElement.textContent = userList.pageLength;
	}else if(event.key === "Backspace" || event.key === "Delete") {
	}else if(event.keyCode > 36 && event.keyCode < 41) {
	}else if(event.keyCode > 47 && event.keyCode < 58) {

	}else {
		event.preventDefault();
		if(event.key === "Enter") {
			pageVisible = parseInt(event.target.innerHTML);
			pageVisible = pageVisible ? pageVisible : 5;
			pageNumber = 0;
			const userList = await getUsers(pageVisible, pageNumber);

			pageNumberElement.textContent = pageNumber + 1;
			pageVisibleElement.textContent = pageVisible;
			pageLengthElement.textContent = userList.pageLength;

			renderUserList(userList);
			event.srcElement.blur();
		}
	}
});

pageVisibleElement.addEventListener("blur", () => {
	pageVisibleElement.textContent = pageVisible;
});

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
	const request = await fetch(`/users?visible=${pageVisible}&page=${pageNumber}${sort ? `&sort=${sort}` : ""}`);
	const requestJson = await request.json();
	return requestJson;
}

loadingElement.classList.add("load");
const userList = await getUsers(pageVisible, pageNumber);

pageNumberElement.textContent = pageNumber + 1;
pageVisibleElement.textContent = pageVisible;
pageLengthElement.textContent = userList.pageLength;
userCountElement.textContent = userList.userLength;

renderUserList(userList);
loadingElement.classList.remove("load");

function renderUserList(userList) {
	userListElement.innerHTML = "";
	userList.page.forEach(user => {
		const userIndex = selectedUsers.findIndex(item => item.user.id === user.id);
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
		const userSelect = userElement.querySelector(".userSelect");
		const userBox = userElement.querySelector(".userSelectBox");

		userSelect.addEventListener("click", _event => {
			const selectFound = selectedUsers.findIndex(item => item.user.id === user.id);
			if(selectFound > -1) {
				selectedUsers.splice(selectFound, 1);
				userBox.style.opacity = null;
			}else {
				userBox.style.opacity = 0.5;
				selectedUsers.push({user, element: userElement});
			}
		});

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

		userListElement.appendChild(userIndex > -1 ? selectedUsers[userIndex].element : userElement);
	});
}
