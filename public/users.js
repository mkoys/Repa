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
const popupEditUser = document.querySelector(".editUser");
const popupExport = document.querySelector(".exportUser");
const exportUserElement = document.querySelector(".actionExportUser");
const cancelNewUser = document.querySelector(".cancelNewUser");
const cancelExportUser = document.querySelector(".cancelExportUser");
const cancelEditUser = document.querySelector(".cancelEditUser");
const calendarDatesElement = document.querySelector(".calendarDates");
const calendarDateTextElement = document.querySelector(".calendarDateText");
const calendarDateNextElement = document.querySelector(".calendarDateNext");
const calendarDatePreviousElement = document.querySelector(".calendarDatePrevious");
const selectedUsersElement = document.querySelector(".selectedUsers");
const newUserUsername = document.querySelector(".usernameUser");
const newUserEmail = document.querySelector(".emailUser");
const newUserFirstname = document.querySelector(".firstnameUser");
const newUserSurname = document.querySelector(".surnameUser");
const newUserPassword = document.querySelector(".passwordUser");
const newUserClass = document.querySelector(".classUser");
const newUserRole = document.querySelector(".roleUser");
const newUserAutoFilter = document.querySelector(".autoFilterUser");
const newUserAction = document.querySelector(".addUserActionButton");
const isAdminCheckbox = document.querySelector("#isAdminAdd");
const isAdminCheck = isAdminCheckbox.querySelector(".checkAdd");
const editUserUsername = document.querySelector(".usernameUserEdit");
const editUserFirstname = document.querySelector(".firstnameUserEdit");
const editUserSurname = document.querySelector(".surnameUserEdit");
const editUserEmail = document.querySelector(".emailUserEdit");
const editUserActionButton = document.querySelector(".editUserActionButton");
const editUserClass = document.querySelector(".classUserEdit");
const editUserRole = document.querySelector(".roleUserEdit");
const editUserAutoFilter = document.querySelector(".autoFilterUserEdit");
const isAdminCheckboxEdit = document.querySelector("#isAdminEdit");
const isAdminCheckEdit = isAdminCheckboxEdit.querySelector(".checkEdit");
const settingsAction = document.querySelector(".settingsDropdown");
const sortBy = document.querySelector("#sortby");
const filterBy = document.querySelector("#filterby");

const MonthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let calendarDates = [];
const calendarState = [];
const rangeSelect = [];
const calendarEvents = [];
const contentState = [];

const calendarDate = new Date();

let calendarDays = generateCalendarDates();

settingsAction.addEventListener("click", _event => window.location = "/settings.html?back=users.html")

let sortValues = ["username", "email", "class", "role", "firstname", "surname"];
let sort = false;

sortBy.addEventListener("blur", async event => {
	const value = event.srcElement.value;
	let match = false;
	for(let sortIndex = 0; sortIndex < sortValues.length; sortIndex++) {
		if(sortValues[sortIndex] === value.toLowerCase()) {
			match = sortValues[sortIndex];
		}
	}
	if(match) {
		sort = match;
		sortBy.style.color = "lime";
	}else {
		sort = false;
		sortBy.style.color = null;
	}
	const userList = await getUsers(pageVisible, pageNumber);
	renderUserList(userList);
	console.log(userList)
}); 

sortBy.addEventListener("keyup", async event => {
	if(event.key === "Enter") {setTimeout(() => { sortBy.blur()}, 0); return;};
	sortBy.style.color = null;
	if(event.key === "Backspace") return;
	if(event.key === "Control") return;
	if(event.ctrlKey) return;
	if(event.shiftKey) return;
	const value = event.srcElement.value;
	let match = false;
	for(let sortIndex = 0; sortIndex < sortValues.length; sortIndex++) {
		if(sortValues[sortIndex].startsWith(value.toLowerCase())) {
			match = sortValues[sortIndex];
		}
	}

	if(match) {
		const selectionEnd = sortBy.selectionEnd;
		const restOfMatch = match.slice(selectionEnd);
		sortBy.value += restOfMatch;
		sortBy.focus();
		sortBy.setSelectionRange(selectionEnd, sortBy.value.length);
	}
})


let filterValues = ["username:", "email:", "class:", "role:", "firstname:", "surname:"];
let filter = {};

filterBy.addEventListener("keyup", async event => {
	const value = event.srcElement.value;
	filterBy.style.color = null;
	if(event.key === "Enter") {
		filterBy.style.color = "lime";
		if(value.length == 0) filter = {};
		const splitParam = value.split(":");
		filter[splitParam[0]] = splitParam[1];
		const userList = await getUsers(pageVisible, pageNumber);
		pageLengthElement.textContent = userList.pageLength;
		userCountElement.textContent = userList.userLength;
		renderUserList(userList);
		return;
	};
	if(event.key === "Backspace") return;
	if(event.key === "Control") return;
	if(event.ctrlKey) return;
	if(event.shiftKey) return;
	let match = false;
	for(let filterIndex = 0; filterIndex < filterValues.length; filterIndex++) {
		if(filterValues[filterIndex].startsWith(value.toLowerCase())) {
			match = filterValues[filterIndex];
		}
	}

	if(match) {
		const selectionEnd = filterBy.selectionEnd;
		const restOfMatch = match.slice(selectionEnd);
		filterBy.value += restOfMatch;
		filterBy.focus();
		filterBy.setSelectionRange(selectionEnd, filterBy.value.length);
	}
})

popupElement.addEventListener("click", event => {
	if(event.srcElement === popupExport || event.srcElement === popupNewUser || event.srcElement === popupEditUser) {
		popupElement.style.opacity = null;
		popupElement.style.visibility = null; 
		popupNewUser.style.display = "none";
		popupExport.style.display = "none";
		popupEditUser.style.display = "none";
	}
});

let editUserInfo = null;

editUserActionButton.addEventListener("click", async _event => {
	let body = { id: editUserInfo.id };
	const username = editUserUsername.value;
	const email = editUserEmail.value;
	const className = editUserClass.value;
	const surname = editUserSurname.value;
	const firstname = editUserFirstname.value;
	const autoFilter = editUserAutoFilter.value;

	if(username.length > 0) body.username = username;
	if(firstname.length > 0) body.firstname = firstname;
	if(autoFilter.length > 0) {
		const filter = [];
		const splitFilter = autoFilter.split(" ");
			const newFilter = new Object();
		splitFilter.forEach(filterItem => {
			const splitItem = filterItem.split(":");
			newFilter[splitItem[0]] = splitItem[1];
		});
		body.autoFilter = newFilter;
	}
	if(surname.length > 0) body.surname = surname;
	if(email.length > 0) body.email = email;
	if(className.length > 0) body.class = className;
	if(isAdminCheckEdit.style.display) body.role = "admin";

	const response = await fetch("/user", {
		method: "PUT",
		body: JSON.stringify(body),
		headers: {
			"Content-type": "application/json",
			Authorization: `token ${token}`
		}
	});

	const responseJson = await response.json();

	popupElement.style.opacity = null;
	popupElement.style.visibility = null; 
	popupNewUser.style.display = "none";
	popupExport.style.display = "none";
	popupEditUser.style.display = "none";
	const userList = await getUsers(pageVisible, pageNumber);
	renderUserList(userList);
});

exportUserElement.addEventListener("click", async _event => {
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
	}else {
		let userList = await getUsers();
		selectedUsersElement.innerHTML = "";
		popupElement.style.opacity = 1;
		popupElement.style.visibility = "visible";
		popupExport.style.display = "flex";
		userList.page.forEach(item => {
			const userElement = document.createElement("div");
			const userAvatarElement = document.createElement("div");
			const userUsernameElement = document.createElement("p");
			userUsernameElement.classList.add("username");
			userAvatarElement.classList.add("avatar");
			userUsernameElement.style.marginLeft = "10px";
			userAvatarElement.style.width = "20px";
			userAvatarElement.style.height= "20px";
			userElement.classList.add("selectedUser");
			userUsernameElement.textContent = item.username;
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
	isAdminCheck.style.display = "none";
	newUserUsername.value = "";
	newUserPassword.value = "";
	newUserEmail.value = "";
	newUserSurname.value = "";
	newUserFirstname.value = "";
	newUserClass.value = "";
}); 

cancelEditUser.addEventListener("click", _event => {
	popupElement.style.opacity = null;
	popupElement.style.visibility = null; 
	popupEditUser.style.display = null;
	isAdminCheckEdit.style.display = null;
	editUserUsername.value = "";
	editUserEmail.value = "";
	editUserClass.value = "";
	editUserFirstname.value = "";
	editUserSurname.value = "";
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

isAdminCheck.style.display = "none";
isAdminCheckbox.addEventListener("click", _event => {
	if(isAdminCheck.style.display) {
		isAdminCheck.style.display = null;
	}else {
		isAdminCheck.style.display = "none";
	}
});

isAdminCheckboxEdit.addEventListener("click", _event => {
	if(isAdminCheckEdit.style.display) {
		isAdminCheckEdit.style.display = null;
	}else {
		isAdminCheckEdit.style.display = "flex";
	}
});

newUserAction.addEventListener("click", async _event => {
  const username = newUserUsername.value;
	const email = newUserEmail.value;
	const firstname = newUserFirstname.value;
	const surname = newUserSurname.value;
	const autoFilter = newUserAutoFilter.value;
	const password = newUserPassword.value;
	const clas = newUserClass.value;
	const isAdmin = isAdminCheck.display ? false : true;


	let body = {firstname, surname, email, username, password, class: clas, role: isAdmin ? "admin" : null };
	if(autoFilter.length > 0) {
		const filter = [];
		const splitFilter = autoFilter.split(" ");
			const newFilter = new Object();
		splitFilter.forEach(filterItem => {
			const splitItem = filterItem.split(":");
			newFilter[splitItem[0]] = splitItem[1];
		});
		body.autoFilter = newFilter;
	}

	
	await fetch("/user", {
		method: "POST",
		headers: {"Content-type": "application/json", Authorization: `token ${token}`},
		body: JSON.stringify(body)
	});

	const userList = await getUsers(pageVisible, pageNumber);
	renderUserList(userList);
	popupElement.style.opacity = null;
	popupElement.style.visibility = null; 
	popupNewUser.style.display = null;
	isAdminCheck.style.display = "none";
	newUserUsername.value = "";
	newUserPassword.value = "";
	newUserEmail.value = "";
	newUserClass.value = "";
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

		calendarDateDayTextElement.textContent = day.getDate();

		calendarDateDayElement.appendChild(calendarDateDayTextElement);
		calendarDateDayElement.appendChild(calendarDateDayDotElement);
		calendarDateElement.appendChild(calendarDateDayElement);
		calendarDatesElement.appendChild(calendarDateElement);

		const foundIndex = calendarState.findIndex(state => compareDates(state.day, day));
		if(foundIndex > -1) {
			calendarState[foundIndex].element = calendarDateElement;
			if(calendarState[foundIndex].multyselect) {
				if(calendarState[foundIndex].multyselect == 2) {
					calendarDateElement.classList.add("rangeSelectStart");
				}else if(calendarState[foundIndex].multyselect == 3) {
					calendarDateElement.classList.add("rangeSelectEnd");
				}else {
					calendarDateElement.classList.add("rangeSelect");
				}
			}

			calendarDateElement.classList.add("multiSelect");
		}

		calendarDateElement.addEventListener("click", (event) => {
			if(event.shiftKey) {
				return;
			}else {
				if(calendarState.length >= 2) {
					while(calendarState.length > 0) calendarState.pop();
					calendarDays = generateCalendarDates();
					calendarDateElement.classList.add("multiSelect");
					calendarState.push({day, element: calendarDateElement})
					calendarDays = generateCalendarDates();
				}else {
					calendarDateElement.classList.add("multiSelect");
					calendarState.push({day, element: calendarDateElement})	
					if(calendarState.length == 2) {
						const check = calendarState[0].day.getTime() > calendarState[1].day.getTime();
						const lower = check ? calendarState[1] : calendarState[0];
						const higher = check ? calendarState[0] : calendarState[1];
						const lowerState = calendarState[calendarState.findIndex(item => compareDates(item.day, lower.day))];
						const higherState = calendarState[calendarState.findIndex(item => compareDates(item.day, higher.day))];
						lowerState.multyselect = 2;
						higherState.multyselect = 3;
						let current = new Date(lower.day);
						while(!compareDates(current, higher.day)) {
							current.setDate(current.getDate() + 1);
							if(!compareDates(current, higher.day)) {
								calendarState.push({day: new Date(current), multyselect: true})	
							}
						}

						calendarDays = generateCalendarDates();
					}
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
	}else if(event.keyCode > 95 && event.keyCode < 106) {
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
	let url = pageVisible ? `/users?visible=${pageVisible}&page=${pageNumber}${sort ? `&sort=${sort}` : ""}` : "/users";
	Object.keys(filter).forEach(key => {
		url += `&${key}=${filter[key]}`
	});
	const request = await fetch(url, {
		headers: {Authorization: `token ${token}`}
	});
	const requestJson = await request.json();
	return requestJson;
}

loadingElement.classList.add("load");
let userList = await getUsers(pageVisible, pageNumber);

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
		const deleteUserAction = userElement.querySelector(".deleteUserAction");
		const editUserAction = userElement.querySelector(".editUserAction");

		editUserAction.addEventListener("click", _event => {
			editUserInfo = user;
			popupElement.style.opacity = 1;
			popupElement.style.visibility = "visible";
			popupEditUser.style.display = "flex";
			editUserUsername.value = user.username;
			editUserEmail.value = user.email;
			editUserClass.value = user.class ? user.class : "";
			editUserSurname.value = user.surname ? user.surname : "";
			editUserFirstname.value = user.firstname ? user.firstname : "";
			isAdminCheckEdit.style.display = user.role === "admin" ? "flex" : null;
			if(user.autoFilter) {
				let string = "";
				Object.keys(user.autoFilter).forEach(key => {
					string += `${key}:${user.autoFilter[key]} `
				});
				editUserAutoFilter.value = string;
			}
		});

		deleteUserAction.addEventListener("click", async () => {
			const request = await fetch(`/user?id=${user.id}`, {
				method: "DELETE",
				headers: {Authorization: `token ${token}`}
			});
			const jsonData = await request.json();
			userList = await getUsers(pageVisible, pageNumber);
			renderUserList(userList);
		});

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


		const capitalize = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

		if(user.avatar) userAvatar.style.backgroundImage = `url(${user.avatar})`;

		if(user.surname || user.firstname) { 
			if(user.firstname && user.surname) {
				const nameString = `${user.firstname.slice(0, 1).toUpperCase()}. ${capitalize(user.surname)}`;
				userName.textContent = nameString.length > 10 ? nameString.substring(0, 8) + "..." : nameString;

			}else if(user.surname) {
				userName.textContent = user.surname.length > 10 ? user.surname.substring(0, 8) + "..." : user.surname;
			}else {
				userName.textContent = user.firstname.length > 10 ? user.firstname.substring(0, 8) + "..." : user.firstname;
			}
		}else {
			userName.textContent = user.username.length > 10 ? user.username.substring(0, 8) + "..." : user.username;
		}
		userEmail.textContent = user.email.length > 18 ? user.email.substring(0, 16) + "..." : user.email;

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

