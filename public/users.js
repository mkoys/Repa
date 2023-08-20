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
const popupExport = document.querySelector(".exportUser");
const exportUserElement = document.querySelector(".actionExportUser");
const cancelNewUser = document.querySelector(".cancelNewUser");
const cancelExportUser = document.querySelector(".cancelExportUser");
const calendarDatesElement = document.querySelector(".calendarDates");
const calendarDateTextElement = document.querySelector(".calendarDateText");
const calendarDateNextElement = document.querySelector(".calendarDateNext");
const calendarDatePreviousElement = document.querySelector(".calendarDatePrevious");
const selectedUsersElement = document.querySelector(".selectedUsers");

const MonthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let calendarDates = [];
const calendarState = [];
const calendarEvents = [];
const contentState = [];

const calendarDate = new Date();

let calendarDays = generateCalendarDates();

popupElement.addEventListener("click", event => {
	if(event.srcElement === popupExport || event.srcElement === popupNewUser) {
		popupElement.style.opacity = null;
		popupElement.style.visibility = null; 
		popupNewUser.style.display = "none";
		popupExport.style.display = "none";
	}
});

exportUserElement.addEventListener("click", _event => {
	if(selectedUsers.length > 0) {
		selectedUsersElement.innerHTML = "";
		popupElement.style.opacity = 1;
		popupElement.style.visibility = "visible";
		popupExport.style.display = "flex";
		selectedUsers.forEach(item => {
			const userElement = document.createElement("div");
			const userAvatarElement = document.createElement("div");
			const userUsernameElement = document.createElement("p");
			userUsernameElement.classList.add("username");
			userAvatarElement.classList.add("avatar");
			userUsernameElement.style.marginLeft = "10px";
			userAvatarElement.style.width = "20px";
			userAvatarElement.style.height= "20px";
			userElement.classList.add("selectedUser");
			userUsernameElement.textContent = item.user.username;
			userElement.appendChild(userAvatarElement);
			userElement.appendChild(userUsernameElement);
			selectedUsersElement.appendChild(userElement);
		});
	}
});

cancelNewUser.addEventListener("click", _event => {
	popupElement.style.opacity = null;
	popupElement.style.visibility = null; 
	popupNewUser.style.display = null;
}); 

cancelExportUser.addEventListener("click", _event => {
	popupElement.style.opacity = null;
	popupElement.style.visibility = null; 
	popupExport.style.display = null;
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

function calendarSetDate(date, action) {
	const index = calendarDates.findIndex(dateItem => compareDates(dateItem, date));
	if(action) {
		if(index > -1) calendarDatesElement.children[index].classList.add("calendarDaySelected");	
		calendarState.push({day: date, element: calendarDatesElement.children[index]})	
	}else {
		if(index > -1) calendarDatesElement.children[index].classList.remove("calendarDaySelected");
		const stateIndex = calendarState.findIndex(state => compareDates(state.day, date));
		calendarState.splice(stateIndex, 1);	
	}
}

function daysInMonth(year, month) {
	const date = new Date(year, month, 1);
	const days = new Array();

	while(date.getMonth() === month) {
		days.push(new Date(date));
		date.setDate(date.getDate() + 1);
	}

	return days;
}

function compareDates(date1, date2) {
	date1.setHours(0, 0, 0, 0);
	date2.setHours(0, 0, 0, 0);

	return date1.getTime() === date2.getTime();
}

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

let sortLock = false;

sortActionElement.addEventListener("mouseenter", _event => {
		sortLock = true;
		sortActionDropdown.style.display = "flex";
		sortActionText.style.color = "var(--text-color)";
		sortActionIcon.style.fill = "var(--text-color)";
});


sortActionElement.addEventListener("mouseleave", _event => {
	sortLock = false;
	setTimeout(() => {
		if(!sortLock) {
			sortActionDropdown.style.display = null;
			sortActionText.style.color = null;
			sortActionIcon.style.fill = null;
		}
		}, 200);
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

function generateCalendarDates() {
	calendarDatesElement.innerHTML = "";
	calendarDateTextElement.textContent = `${MonthsOfYear[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;

	const previousMonthDate = new Date(calendarDate); 
	previousMonthDate.setMonth(calendarDate.getMonth() - 1);
	const nextMonthDate = new Date(calendarDate); 
	nextMonthDate.setMonth(calendarDate.getMonth() + 1);

	const previousDays = daysInMonth(previousMonthDate.getFullYear(), previousMonthDate.getMonth());
	const currentDays = daysInMonth(calendarDate.getFullYear(), calendarDate.getMonth());
	const nextDays = daysInMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth());

	let calendarDays = [];

	if(currentDays[0].getDay() != 1) {
		while(calendarDays.length < currentDays[0].getDay() - 1) {
			calendarDays.push(previousDays[previousDays.length - 1 - calendarDays.length]);
		}

		calendarDays.reverse();
	}

	calendarDays = calendarDays.concat(currentDays);

	for(let index = 0; calendarDays.length < 42; index++) {
		calendarDays.push(nextDays[index]);
	}

	const todayDate = new Date();

	calendarDays.forEach(day => {
		const calendarDateElement = document.createElement("div");
		const calendarDateDayElement = document.createElement("div");
		const calendarDateDayTextElement = document.createElement("p");
		const calendarDateDayDotElement = document.createElement("div");

		calendarDateElement.classList.add("calendarDate");
		calendarDateDayElement.classList.add("calendarDateDay");
		calendarDateDayTextElement.classList.add("calendarDateDayText");
		calendarDateDayDotElement.classList.add("calendarDateDayDot");

		if(day.getMonth() !== calendarDate.getMonth()) {
			calendarDateDayTextElement.classList.add("disabledDate");
			calendarDateElement.classList.add("disabledDateBox");
		}

		if(compareDates(todayDate, day)) {
			calendarDateElement.classList.add("todayDate");
		}

		calendarDateDayTextElement.textContent = day.getDate();

		calendarDateDayElement.appendChild(calendarDateDayTextElement);
		calendarDateDayElement.appendChild(calendarDateDayDotElement);
		calendarDateElement.appendChild(calendarDateDayElement);
		calendarDatesElement.appendChild(calendarDateElement);

		const foundIndex = calendarState.findIndex(state => compareDates(state.day, day));
		if(foundIndex > -1) {
			calendarState[foundIndex].element = calendarDateElement;
			calendarDateElement.classList.add("calendarDaySelected");
		}

		calendarDateElement.addEventListener("click", (event) => {
			if(event.shiftKey) {
				return;
			}else {
				const stateIndex = calendarState.findIndex(state => compareDates(state.day, day));
				if(stateIndex > -1) {
					calendarDateElement.classList.remove("calendarDaySelected");
					calendarState.splice(stateIndex, 1);	
					calendarEvent(day, false);
				}else {
					if(!event.ctrlKey) {
						while(calendarState.length != 0) {
							const element = calendarState[calendarState.length - 1].element;
							element.classList.remove("calendarDaySelected");
							calendarEvent(calendarState[calendarState.length - 1].day, false);
							calendarState.pop(stateIndex, 1);
						}
					}

					calendarDateElement.classList.add("calendarDaySelected");
					calendarState.push({day, element: calendarDateElement})	
					calendarEvent(day, true);
				}
			}
		});
	});

	return calendarDays;
}


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
		const moreAction = userElement.querySelector(".userActionMoreBox");
		const moreDropdown = userElement.querySelector(".userBoxDropdown");

		moreAction.addEventListener("mouseenter", _event => {
			moreDropdown.style.opacity = 1;
			moreDropdown.style.visibility = "visible";
		});

		moreAction.addEventListener("mouseleave", _event => {
			moreDropdown.style.opacity = null;
			moreDropdown.style.visibility = null;
		});

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
