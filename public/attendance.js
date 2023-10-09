const calendarDatesElement = document.querySelector(".calendarDates");
const calendarDateTextElement = document.querySelector(".calendarDateText");
const calendarDateNextElement = document.querySelector(".calendarDateNext");
const calendarDatePreviousElement = document.querySelector(".calendarDatePrevious");
const mainElement = document.querySelector(".main");
const attendanceElementTemplate = document.querySelector("#attendanceTemplate");
const roleElement = document.querySelector(".role");
const usernameElement = document.querySelector(".username");
const avatarElement = document.querySelector(".avatar");
const userBoxOther = document.querySelector(".userBoxOther");
const usernameOtherElement = document.querySelector(".usernameOther");
const roleOtherElement = document.querySelector(".roleOther");
const userBack = document.querySelector(".userBack"); 
const userDropdownElement = document.querySelector(".userBoxDropdown");
const userMoreElement = document.querySelector(".userMoreIcon");
const userAdminDropdowns = document.querySelectorAll(".dropdownAdmin");
const logoutDropdownElement = document.querySelector(".logoutDropdown");
const attendanceDropdownElement = document.querySelector(".attendanceDropdown");
const usersDropdownElement = document.querySelector(".usersDropdown");
const calendarDatePickerElement = document.querySelector(".calendarDatePickerIcon");
const calendarYearDropdownElement = document.querySelector(".calendarYearDropdown");
const settingsAction = document.querySelector(".settingsDropdown");

const token = localStorage.getItem("token");
if(!token) window.location = "/login.html";

settingsAction.addEventListener("click", _event => window.location = "/settings.html?back=attendance.html")

calendarDatePickerElement.addEventListener("click", event => {
	if(calendarDatePickerElement.classList.contains("rotate")) {
		calendarYearDropdownElement.innerHTML = "";
		calendarDatePickerElement.classList.remove("rotate");
		calendarYearDropdownElement.style.display = "flex";
		const currentYear = calendarDate.getFullYear();

		const allYears = [];
		let currentYearElement = null;

		for(let index = currentYear; index >= currentYear - 10;index--) allYears.push(index);
		allYears.reverse();
		for(let index = currentYear + 1; index <= currentYear + 10;index++) allYears.push(index);

		allYears.forEach(year => {
			const yearElement = document.createElement("p");
			if(year == currentYear) {
				currentYearElement = yearElement;
				yearElement.classList.add("currentYear");
			}
			yearElement.textContent = year;
			yearElement.classList.add("yearText");
			yearElement.addEventListener("click", _event => {
				calendarDate.setFullYear(year);
				calendarDates = generateCalendarDates();
				calendarDatePickerElement.classList.add("rotate");
				calendarYearDropdownElement.style.display = null;
			});
			calendarYearDropdownElement.appendChild(yearElement);
		});
		currentYearElement.scrollIntoView();
	}else {
		calendarDatePickerElement.classList.add("rotate");
		calendarYearDropdownElement.style.display = null;
	}
});

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
roleElement.textContent = userDataJson.role ? userDataJson.role : "Student";
if(userDataJson.avatar) avatarElement.style.backgroudImage = `url(${userDataJson.avatar})`;

let userIdentifier = false;
let userUsername = false;
let userRole = false;
let rangeSelect = [];
let rangeCount = 0;

userBack.addEventListener("click", () => window.location.href = "/users.html");

if(userAdmin) {
	for(let param of new URLSearchParams(window.location.search)) {
		if(param[0] === "id") userIdentifier = param[1];
		if(param[0] === "username") userUsername = param[1];
		if(param[0] === "role") userRole = param[1];
	}
	
	userAdminDropdowns.forEach(element => {
		element.style.display = "flex";
	});
}

const userMode = userIdentifier ? 1 : 0;

if(userIdentifier) {
	userBoxOther.style.display = "flex";
	usernameOtherElement.textContent = userUsername;
	if(userRole !== "undefined") {
		roleOtherElement.textContent = userRole;
	}else {
		roleOtherElement.textContent = "Student";
	}
}

const MonthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let calendarDates = [];
const calendarState = [];
const calendarEvents = [];
const contentState = [];

const calendarDate = new Date();
const attendances = await fetch(`/attendance${userIdentifier ? `?id=${userIdentifier}` : ""}`, {headers: {Authorization: `token ${token}`}}).then(async res => await res.json());

attendances.forEach(attendance => {
	attendance.date = new Date(attendance.date);
});

calendarDates = generateCalendarDates();

calendarDateNextElement.addEventListener("click", () => {
	calendarDate.setMonth(calendarDate.getMonth() + 1);
	calendarDates = generateCalendarDates();
});

calendarDatePreviousElement.addEventListener("click", () => {
	calendarDate.setMonth(calendarDate.getMonth() - 1);
	calendarDates = generateCalendarDates();
});

function calendarEvent(date, action) {
	if(typeof date.multi === "number") {
		const multiElement = document.querySelector("#attendanceMultiTemplate").content.cloneNode(true);
		const multiAttendanceElement = multiElement.querySelector(".attendanceMulti");
		const multiContentElement = multiElement.querySelector(".attendanceMultiContent");
		const multiSubmit = multiElement.querySelector(".multiSubmit");
		const multiSubmitIcon = multiSubmit.querySelector(".attendanceSubmitIcon");
		const multiAcceptIcon = multiSubmit.querySelector(".attendanceAccept");
		const multiSave = multiElement.querySelector(".multiSave");
		const multiSaveIcon = multiSave.querySelector(".attendanceSaveIcon");
		const multiDeclineIcon = multiSave.querySelector(".attendanceDecline");
		const multiMore = multiElement.querySelector(".multiMore");
		const multiHeader = multiElement.querySelector(".rangeDate");
		const multiClose = multiElement.querySelector(".multiClose");
		multiHeader.textContent = `${date.days[0].getDate()}. ${MonthsOfYear[date.days[0].getMonth()]} ${date.days[0].getFullYear()} - ${date.days[date.days.length - 1].getDate()}. ${MonthsOfYear[date.days[date.days.length - 1].getMonth()]} ${date.days[date.days.length - 1].getFullYear()}`
		const attendancesRange = [];

		if(userMode) {
			multiSaveIcon.style.display = "none";
			multiAcceptIcon.style.display = "flex";
			multiSubmitIcon.style.display = "none";
			multiDeclineIcon.style.display = "flex";
		}else {
			multiSaveIcon.style.display = "flex";
			multiAcceptIcon.style.display = "none";
			multiSubmitIcon.style.display = "flex";
			multiDeclineIcon.style.display = "none";
		}

		let highestStatus = 0;

		date.days.forEach(date => {
			const stateIndex = attendances.findIndex(item => compareDates(date, item.date));
			if(stateIndex > -1) {
				if(attendances[stateIndex].status > highestStatus) {
					highestStatus = attendances[stateIndex].status;
				}
			}
		})

		multiSave.addEventListener("click", () => {
			console.log(attendancesRange)
			attendancesRange.forEach(item => item.saveAttendance());
			highestStatus = 1;
			setStatus(highestStatus);
		});

		multiSubmit.addEventListener("click", () => {
			console.log(attendancesRange)
			attendancesRange.forEach(item => item.submitAttendance());
			highestStatus = 2;
			setStatus(highestStatus);
		});

		setStatus(highestStatus);

		function setStatus(newStatus) {
			status = newStatus;
			if(status == 0) {
				if(!userMode) {
					multiSubmit.disabled = true;
					multiMore.disabled = false;
					multiSave.disabled = false;
				}else {
					multiSubmit.disabled = true;
					multiMore.disabled = true;
					multiSave.disabled = true;
				}
			}else if(status == 1) {
				if(!userMode) {
					multiSubmit.disabled = false;
					multiMore.disabled = false;
					multiSave.disabled = false;
				}else {
					multiSubmit.disabled = true;
					multiMore.disabled = true;
					multiSave.disabled = true;
				}
			}else if(status == 2) {
				if(!userMode) {
					multiSubmit.disabled = true;
					multiMore.disabled = false;
					multiSave.disabled = true;
				}else {
					multiSubmit.disabled = false;
					multiMore.disabled = false;
					multiSave.disabled = false;
				}
			}else if(status == 3) {
				if(!userMode) {
					multiSubmit.disabled = true;
					multiMore.disabled = false;
					multiSave.disabled = true;
				}else {
					multiSubmit.disabled = false;
					multiMore.disabled = false;
					multiSave.disabled = false;
				}
			}else if(status == 4) {
				if(!userMode) {
					multiSubmit.disabled = true;
					multiMore.disabled = false;
					multiSave.disabled = true;
				}else {
					multiSubmit.disabled = true;
					multiMore.disabled = false;
					multiSave.disabled = true;
				}
			}
		}

		date.days.forEach(date => {
			if(action) {
				const foundAttendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, date));
				let attendance;
				if(foundAttendanceIndex > -1) {
					if(date.getDay() != 0 && date.getDay() != 6) {
						const attendanceData = attendances[foundAttendanceIndex];
						attendance = createAttendance({date: date, status: attendanceData.status, checkbox: attendanceData.place, content: attendanceData.content, multi: true});
						attendancesRange.push(attendance);
					}
				}else {
					if(!userMode) {
						if(date.getDay() != 0 && date.getDay() != 6) {
							attendance = createAttendance({date: date, status: 0, multi: true });
							attendancesRange.push(attendance);
						}
					}else {
						calendarSetDate(date, false);
					}
				}
				if(attendance) {
					const element = mainElement.children[attendance.index];
					contentState.push({date, attendance, element: multiAttendanceElement});
					multiClose.addEventListener("click", () => {
						const contentIndex = contentState.findIndex(state => compareDates(date, state.date));
						if(mainElement.contains(contentState[contentIndex].element)) {
							mainElement.removeChild(contentState[contentIndex].element);
						}
						calendarSetDate(date, false);
						contentState.splice(contentIndex, 1);
					})
				}
			}else {
				const index = contentState.findIndex(state => compareDates(date, state.date));
				if(index > -1) {
					mainElement.removeChild(contentState[index].element);
					contentState.splice(index, 1);
				}
			}
		});

		attendancesRange.forEach(attendance => {
			multiContentElement.appendChild(attendance.element);
		});

		if(multiContentElement.children.length > 0) {
			mainElement.appendChild(multiElement);
		}
	}else {
		if(action) {
			const foundAttendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, date));
			let attendance;
			if(foundAttendanceIndex > -1) {
				const attendanceData = attendances[foundAttendanceIndex];
				attendance = createAttendance({date: date, status: attendanceData.status, checkbox: attendanceData.place, content: attendanceData.content});
			}else {
				if(!userMode) {
					attendance = createAttendance({date: date, status: 0 });
				}else {
					calendarSetDate(date, false);
				}
			}
			const element = mainElement.children[attendance.index];
			contentState.push({date, attendance, element});
			attendance.close(() => {
				const contentIndex = contentState.findIndex(state => compareDates(date, state.date));
				mainElement.removeChild(contentState[contentIndex].element);
				contentState.splice(contentIndex, 1);
				calendarSetDate(date, false);
			});
		}else {
			const index = contentState.findIndex(state => compareDates(date, state.date));

			if(index > -1) {
				if(mainElement.contains(contentState[index].element)) {
					mainElement.removeChild(contentState[index].element);
				}

				contentState.splice(index, 1);
			}
		}
	}
}

function createAttendance({ date, status, checkbox, onClose, content, multi } = {}) {
	const attendanceElementCopy = attendanceElementTemplate.content.cloneNode(true);
	const attendanceDateElement = attendanceElementCopy.querySelector(".attendanceDate");
	const attendanceStatusElement = attendanceElementCopy.querySelector(".attendanceStatus");
	const attendanceMoreElement = attendanceElementCopy.querySelector(".attendanceMore");
	const attendanceSaveElement = attendanceElementCopy.querySelector(".attendanceSave");
	const attendanceSubmitElement = attendanceElementCopy.querySelector(".attendanceSubmit");
	const attendanceCheckboxSchool = attendanceElementCopy.querySelector("#school");
	const attendanceCheckboxSchoolBox = attendanceCheckboxSchool.querySelector(".boxcheck");
	const attendanceCheckboxSchoolCheck = attendanceCheckboxSchool.querySelector(".check");
	const attendanceCheckboxCompany = attendanceElementCopy.querySelector("#company");
	const attendanceCheckboxCompanyBox = attendanceCheckboxCompany.querySelector(".boxcheck");
	const attendanceCheckboxCompanyCheck = attendanceCheckboxCompany.querySelector(".check");
	const attendanceCloseElement = attendanceElementCopy.querySelector(".attendanceClose");
	const attendanceContentElement = attendanceElementCopy.querySelector(".attendanceContent");
	const attendanceAccept = attendanceElementCopy.querySelector(".attendanceAccept");
	const attendanceDecline = attendanceElementCopy.querySelector(".attendanceDecline");
	const attendanceSaveIcon = attendanceElementCopy.querySelector(".attendanceSaveIcon");
	const attendanceSubmitIcon = attendanceElementCopy.querySelector(".attendanceSubmitIcon");
	const attendanceHeader = attendanceElementCopy.querySelector(".attendanceHeader");
	const index = mainElement.children.length;

	if(multi) {			
		attendanceMoreElement.style.display = "none";
		attendanceCloseElement.style.display = "none";
		attendanceSaveElement.style.display = "none";
		attendanceSubmitElement.style.display = "none";
		attendanceHeader.style.gridTemplateColumns = "auto auto";
		attendanceDateElement.style.margin = "0px";
	}else {
		if(userMode) {
			attendanceSaveIcon.style.display = "none";
			attendanceAccept.style.display = "flex";
			attendanceSubmitIcon.style.display = "none";
			attendanceDecline.style.display = "flex";
		}else {
			attendanceSaveIcon.style.display = "flex";
			attendanceAccept.style.display = "none";
			attendanceSubmitIcon.style.display = "flex";
			attendanceDecline.style.display = "none";
		}
	}

	let lastInput = attendanceElementCopy.querySelector(".attendanceInput");

	const inputCopy = lastInput.cloneNode(true);

	let checkboxDisable = false;

	attendanceCheckboxCompanyCheck.style.display = "none";
	attendanceCheckboxSchoolCheck.style.display = "none";
	attendanceCheckboxCompanyBox.addEventListener("click", _event => checkCheckbox(attendanceCheckboxCompanyCheck, attendanceCheckboxSchoolCheck, checkboxDisable));
	attendanceCheckboxSchoolBox.addEventListener("click", _event => checkCheckbox(attendanceCheckboxSchoolCheck, attendanceCheckboxCompanyCheck, checkboxDisable));

	setContent(content);

	if(userMode && !content) setTimeout(() => onClose({ date }), 0);

	function setContent(content) {
		attendanceContentElement.innerHTML = "";

		lastInput = inputCopy.cloneNode(true);

		attendanceContentElement.appendChild(lastInput);

		if(content) {
			content.forEach(row => {
				const newInput = inputCopy.cloneNode(true);
				const newInputDescription = newInput.querySelector(".attendanceInputDescription");
				const newInputTime = newInput.querySelector(".attendanceInputTime");
				const newInputClass = newInput.querySelector(".attendanceInputClass");

				newInputDescription.value = row.description;
				newInputTime.value = row.time;
				newInputClass.value = row.class;

				if(status == 3 && !userMode) {
					newInputDescription.addEventListener("keyup", removeInputListener);
					newInputTime.addEventListener("keyup", removeInputListener);
					newInputClass.addEventListener("keyup", removeInputListener);

					newInput.addEventListener("dragover", event => event.preventDefault());
					newInput.addEventListener("dragstart", event => {
						const source = event.srcElement;
						if(!source.draggable) source = source.parentNode;
						event.dataTransfer.setData("elm", Array.from(source.parentNode.children).findIndex(item => source === item));
					});
					newInput.addEventListener("drop", dragListener);
				}else {
					newInputDescription.disabled = true;
					newInputTime.disabled = true;
					newInputClass.disabled = true;
				}
				attendanceContentElement.insertBefore(newInput, lastInput);
			});
		}

		const lastInputDescription = lastInput.querySelector(".attendanceInputDescription");
		const lastInputTime = lastInput.querySelector(".attendanceInputTime");
		const lastInputClass = lastInput.querySelector(".attendanceInputClass");

		if(userMode) {
			lastInputDescription.disabled = true;
			lastInputTime.disabled = true;
			lastInputClass.disabled = true;
		}

		if(status == 3 && !userMode) {
			lastInput.addEventListener("dragover", event => event.preventDefault());
			lastInput.addEventListener("dragstart", event => {
				const source = event.srcElement;
				if(!source.draggable) source = source.parentNode;
				event.dataTransfer.setData("elm", Array.from(source.parentNode.children).findIndex(item => source === item));
			});
			lastInput.addEventListener("drop", dragListener);

			lastInputDescription.addEventListener("keydown", addInputListener);
			lastInputTime.addEventListener("keydown", addInputListener);
			lastInputClass.addEventListener("keydown", addInputListener);
			lastInputDescription.addEventListener("keyup", removeInputListener);
			lastInputTime.addEventListener("keyup", removeInputListener);
			lastInputClass.addEventListener("keyup", removeInputListener);
		}else {
			lastInput.parentNode.removeChild(lastInput);	
		}
	}

	attendanceSubmitElement.addEventListener("click", async event => {
		submitAttendance(event);
	});

	async function submitAttendance(event) {
		if(!attendanceContentElement.parentNode.disabled) {
			const response = await fetch(`/attendance${userIdentifier ? `?id=${userIdentifier}${userMode ? `&status=4` : ""}` : ""}`, {
				method: "PUT",
				headers: { "Content-type": "application/json", Authorization: `token ${token}` },
				body: JSON.stringify({date})
			});
			const responseJson = await response.json();
			const attendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, date));
			attendances[attendanceIndex].status = userMode ? 4 : 2;
			calendarDates = generateCalendarDates();
			setStatus(userMode ? 4 : 2);
			setContent(attendances[attendanceIndex].content);
		}
	}

	attendanceSaveElement.addEventListener("click", async event => {
		saveAttendance(event)
	});

	async function saveAttendance(event) {
		if(!attendanceContentElement.parentNode.disabled) {
			let content = [];

			Array.from(attendanceContentElement.children).forEach(child => {
				const inputDescription = child.querySelector(".attendanceInputDescription");
				const inputTime = child.querySelector(".attendanceInputTime");
				const inputClass = child.querySelector(".attendanceInputClass");

				if(inputDescription.value.length > 0 || inputTime.value.length > 0 || inputClass.value.length > 0) {
					content.push({
						description: inputDescription.value,
						time: inputTime.value,
						class: inputClass.value
					});
				}
			});

			const body = {
				place: getABox(),
				date,
				content,
				status: userMode ? 3 : 1
			}

			const response = await fetch(`/attendance${userIdentifier ? `?id=${userIdentifier}` : ""}`, {
				method: "POST",
				headers: { "Content-type": "application/json", Authorization: `token ${token}` },
				body: JSON.stringify(body)
			});

			const responseJson = await response.json();

			if(!responseJson.error) {
				const foundAttendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, date));
				if(foundAttendanceIndex > -1) {
					attendances.splice(foundAttendanceIndex, 1, body);
				}else {
					attendances.push(body)
				}
				calendarDates = generateCalendarDates();
				setStatus(userMode ? 3 : 1);
				setContent(content);
			}
		}

	}

	attendanceCloseElement.addEventListener("click", event => {
		if(onClose) onClose({ date });
	});

	function addInputListener(event) {
		if(event.which >= 48) {
			const parent = event.srcElement.parentNode;
			const parentOfParent = parent.parentNode; 
			const inputDescription = parent.querySelector(".attendanceInputDescription");
			const inputTime = parent.querySelector(".attendanceInputTime");
			const inputClass = parent.querySelector(".attendanceInputClass");

			inputDescription.removeEventListener("keydown", addInputListener);
			inputTime.removeEventListener("keydown", addInputListener);
			inputClass.removeEventListener("keydown", addInputListener);

			const newInput = inputCopy.cloneNode(true);
			const newInputDescription = newInput.querySelector(".attendanceInputDescription");
			const newInputTime = newInput.querySelector(".attendanceInputTime");
			const newInputClass = newInput.querySelector(".attendanceInputClass");

			newInputDescription.addEventListener("keydown", addInputListener);
			newInputTime.addEventListener("keydown", addInputListener);
			newInputClass.addEventListener("keydown", addInputListener);
			newInputDescription.addEventListener("keyup", removeInputListener);
			newInputTime.addEventListener("keyup", removeInputListener);
			newInputClass.addEventListener("keyup", removeInputListener);

			newInput.addEventListener("dragover", event => event.preventDefault());
			newInput.addEventListener("dragstart", event => {
				const source = event.srcElement;
				if(!source.draggable) source = source.parentNode;
				event.dataTransfer.setData("elm", Array.from(source.parentNode.children).findIndex(item => source === item));
			});
			newInput.addEventListener("drop", dragListener);

			parentOfParent.appendChild(newInput);
		}
	}

	function dragListener(event) {
		event.preventDefault();
		let source = event.srcElement;
		if(!source.draggable) source = source.parentNode;
		const mainIndex = event.dataTransfer.getData("elm");
		const sourceIndex = Array.from(source.parentNode.children).findIndex(item => source === item)
		const main = source.parentNode.children[mainIndex];
		if(sourceIndex > mainIndex) {
			source.parentNode.insertBefore(source, main);
		}else {
			source.parentNode.insertBefore(main, source);
		}

		Array.from(source.parentNode.children).forEach((child, childIndex) => {
			const inputDescription = child.querySelector(".attendanceInputDescription");
			const inputTime = child.querySelector(".attendanceInputTime");
			const inputClass = child.querySelector(".attendanceInputClass");
			inputDescription.removeEventListener("keydown", addInputListener);
			inputTime.removeEventListener("keydown", addInputListener);
			inputClass.removeEventListener("keydown", addInputListener);

			if(childIndex == source.parentNode.children.length - 1) {
				inputDescription.addEventListener("keydown", addInputListener);
				inputTime.addEventListener("keydown", addInputListener);
				inputClass.addEventListener("keydown", addInputListener);
			}
		});
	}

	function removeInputListener(event) {
		if(event.which == 8 || event.which == 46) {
			const parent = event.srcElement.parentNode;
			const parentOfParent = parent.parentNode; 
			const inputDescription = parent.querySelector(".attendanceInputDescription");
			const inputTime = parent.querySelector(".attendanceInputTime");
			const inputClass = parent.querySelector(".attendanceInputClass");
			const parentIndex = Array.from(parentOfParent.children).findIndex(child => child === parent);
			const nextChild =  parentOfParent.children[parentIndex + 1];

			if(parentIndex > 0 && !nextChild) {
				const child = parentOfParent.children[parentIndex - 1];
				const inputDescription = child.querySelector(".attendanceInputDescription");
				const inputTime = child.querySelector(".attendanceInputTime");
				const inputClass = child.querySelector(".attendanceInputClass");

				if(inputDescription.value.length != 0 || inputTime.value.length != 0 || inputClass.value.length != 0) {
					return;
				}
			}

			if(inputDescription.value.length == 0 && inputTime.value.length == 0 && inputClass.value.length == 0 && parentOfParent.children.length > 1) {
				parentOfParent.removeChild(parent)
			}
		}
	}

	setStatus(status);
	setDate(date);
	if(checkbox !== undefined) checkABox(checkbox); 

	if(!multi) mainElement.appendChild(attendanceElementCopy);

	function setStatus(newStatus) {
		status = newStatus;
		if(status == 0) {
			attendanceStatusElement.textContent = "Unsaved";
			attendanceStatusElement.style.opacity = 0.7;
			attendanceStatusElement.style.color = "var(--text-color)";
			if(!userMode) {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = false;
			}else {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = true;
				attendanceSaveElement.disabled = true;
			}
		}else if(status == 1) {
			attendanceStatusElement.textContent = "Saved";
			attendanceStatusElement.style.color = "var(--text-color)";
			attendanceStatusElement.style.opacity = 1;
			if(!userMode) {
				attendanceSubmitElement.disabled = false;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = false;
			}else {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = true;
				attendanceSaveElement.disabled = true;
			}
		}else if(status == 2) {
			checkboxDisable = true;
			attendanceStatusElement.textContent = "Submited";
			attendanceStatusElement.style.color = "yellow";
			attendanceStatusElement.style.opacity = 1;
			if(!userMode) {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = true;
			}else {
				attendanceSubmitElement.disabled = false;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = false;
			}
		}else if(status == 3) {
			attendanceStatusElement.textContent = "Declined";
			attendanceStatusElement.style.color = "red";
			attendanceStatusElement.style.opacity = 1;
			if(!userMode) {
				attendanceSubmitElement.disabled = false;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = false;
			}else {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = true;
			}
		}else if(status == 4) {
			checkboxDisable = true;
			attendanceStatusElement.textContent = "Accepted";
			attendanceStatusElement.style.color = "lime";
			attendanceStatusElement.style.opacity = 1;
			if(!userMode) {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = true;
			}else {
				attendanceSubmitElement.disabled = true;
				attendanceMoreElement.disabled = false;
				attendanceSaveElement.disabled = true;
			}
		}
	}

	function checkABox(id) {
		if(id == 1) {
			checkCheckbox(attendanceCheckboxCompanyCheck, attendanceCheckboxSchoolCheck)
		}else if(id == 0) {
			checkCheckbox(attendanceCheckboxSchoolCheck, attendanceCheckboxCompanyCheck)
		}
	}

	function getABox() {
		if(!attendanceCheckboxSchoolCheck.style.display) {
			return 0;
		}else if(!attendanceCheckboxCompanyCheck.style.display) {
			return 1;
		}else {
			return 2;
		}
	}

	function checkCheckbox(primary, secondary, disabled) {
		if(!disabled) {
			if(primary.style.display === "none") {
				primary.style.display = null;
				if(secondary.style.display !== "none") {
					secondary.style.display = "none";
				}
			}else {
				primary.style.display = "none";
			}
		}
	}

	function setDate(date) {
		attendanceDateElement.textContent = `${date.getDate()}. ${MonthsOfYear[date.getMonth()]} ${date.getFullYear()}`;
	}

	return {index, submitAttendance, saveAttendance, close: (callback) => {onClose = callback}, setDate, element: attendanceElementCopy};
}



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

	if(currentDays[0].getDay() == 0) {
		while(calendarDays.length < 6) {
			calendarDays.push(previousDays[previousDays.length - 1 - calendarDays.length]);
		}
	}else if(currentDays[0].getDay() != 1) {
		while(calendarDays.length < currentDays[0].getDay() - 1) {
			calendarDays.push(previousDays[previousDays.length - 1 - calendarDays.length]);
		}
	}

	calendarDays.reverse();

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

		if(day.getDay() == 6 || day.getDay() == 0) {
			calendarDateDayTextElement.classList.add("disallowedDateBox");
		}

		if(day.getMonth() !== calendarDate.getMonth()) {
			calendarDateDayTextElement.classList.add("disabledDate");
			calendarDateElement.classList.add("disabledDateBox");
		}

		if(compareDates(todayDate, day)) {
			calendarDateElement.classList.add("todayDate");
		}

		const foundAttendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, day));
		if(foundAttendanceIndex > -1) {
			switch(attendances[foundAttendanceIndex].status) {
				case 1: 
					calendarDateDayDotElement.classList.add("savedDate");
					break;
				case 2: 
					calendarDateDayDotElement.classList.add("submitedDate");
					break;
				case 3: 
					calendarDateDayDotElement.classList.add("declinedDate");
					break;
				case 4: 
					calendarDateDayDotElement.classList.add("acceptedDate");
					break;
				default: break;
			}
		}

		calendarDateDayTextElement.textContent = day.getDate();

		calendarDateDayElement.appendChild(calendarDateDayTextElement);
		calendarDateDayElement.appendChild(calendarDateDayDotElement);
		calendarDateElement.appendChild(calendarDateDayElement);
		calendarDatesElement.appendChild(calendarDateElement);

		const foundIndex = calendarState.findIndex(state => compareDates(state.day, day));
		if(foundIndex > -1) {
			if(calendarState[foundIndex].multiselect) {
				if(calendarState[foundIndex].multiselect == 2) {
					calendarDateElement.classList.add("rangeSelectStart");
				}else if(calendarState[foundIndex].multiselect == 3) {
					calendarDateElement.classList.add("rangeSelectEnd");
				}else {
					calendarDateElement.classList.add("rangeSelect");
				}
			}else {
				calendarDateElement.classList.add("calendarDaySelected");
			}
			calendarState[foundIndex].element = calendarDateElement;
		}

		const rangeIndex = rangeSelect.findIndex(state => compareDates(state.day, day));
		if(rangeIndex > -1) {
			rangeSelect[rangeIndex].element = calendarDateElement;
			calendarDateElement.classList.add("multiSelect");
		}

		calendarDateElement.addEventListener("click", (event) => {
			if(!calendarDateDayTextElement.classList.contains("disallowedDateBox")) {
				if(event.shiftKey) {
					const rangeIndex = rangeSelect.findIndex(state => compareDates(state.day, day));
					let reset = false;
					if(rangeIndex > -1) {
						rangeSelect[rangeIndex].element.classList.remove("multiSelect")
						rangeSelect.splice(rangeIndex, 1);
						reset = true;
					}else {
						rangeSelect.push({element: calendarDateElement, day})
						calendarDateElement.classList.add("multiSelect");

						if(rangeSelect.length > 1) {
							const big = rangeSelect[rangeSelect[0].day.getTime() > rangeSelect[1].day.getTime() ? 0 : 1];
							const small = rangeSelect[rangeSelect[0].day.getTime() > rangeSelect[1].day.getTime() ? 1 : 0];
							const endDay = new Date(big.day)
							endDay.setDate(endDay.getDate() + 1);
							small.element.classList.remove("multiSelect");
							big.element.classList.remove("multiSelect");
							let rangeDays = [];

							let current = new Date(small.day);
							while(!compareDates(current, endDay)) {
								rangeDays.push(new Date(current))

								if(calendarState.findIndex(item => compareDates(item.day, current)) > -1) {
									while(calendarState.findIndex(item => item.multi == rangeCount) > -1) {
										const index = calendarState.findIndex(item => item.multi == rangeCount);
										calendarState.splice(index, 1);
									}
									reset = true;
									rangeCount--;
									break;
								}

								if(compareDates(current, big.day)) {
									calendarState.push({day: new Date(current), multiselect: 3, multi: rangeCount})	
								} else if(compareDates(current, small.day)) {
									calendarState.push({day: new Date(current), multiselect: 2, multi: rangeCount})	
								}else {
									calendarState.push({day: new Date(current), multiselect: 1, multi: rangeCount})	
								}
								current.setDate(current.getDate() + 1);
							}

							rangeCount++;
							while(rangeSelect.length > 0) rangeSelect.pop();
							if(!reset) {
								calendarDays = generateCalendarDates();
								calendarEvent({multi: rangeCount-1, days: rangeDays}, true);
							}
						}
					}
					return;
				}else {
					const stateIndex = calendarState.findIndex(state => compareDates(state.day, day));
					if(stateIndex > -1) {
						if(calendarState[stateIndex].multiselect) {
							const multi = calendarState[stateIndex].multi;
							while(calendarState.findIndex(item => item.multi == multi) > -1) {
								const index = calendarState.findIndex(item => item.multi == multi);
								calendarState[index].element.classList.remove("rangeSelect");
								calendarState[index].element.classList.remove("rangeSelectUser");
								calendarState[index].element.classList.remove("rangeSelectStart");
								calendarState[index].element.classList.remove("rangeSelectEnd");
								calendarEvent(calendarState[index].day, false);
								calendarState.splice(index, 1);
							}
						}else {
							calendarDateElement.classList.remove("calendarDaySelected");
							calendarEvent(day, false);
							calendarState.splice(stateIndex, 1);	
						}
					}else {
						if(!event.ctrlKey) {
							rangeSelect.forEach(item => item.element.classList.remove("multiSelect"))
							let stop = false;
							while(calendarState.length != 0 && !stop) {
								const element = calendarState[calendarState.length - 1].element;
								element.classList.remove("calendarDaySelected");
								element.classList.remove("rangeSelect");
								element.classList.remove("rangeSelectUser");
								element.classList.remove("rangeSelectStart");
								element.classList.remove("rangeSelectEnd");
								calendarEvent(calendarState[calendarState.length - 1].day, false);
								calendarState.pop();
							}
						}

						calendarDateElement.classList.add("calendarDaySelected");
						calendarState.push({day, element: calendarDateElement})	
						calendarEvent(day, true);
					}
				}
			}
		});
	});

	return calendarDays;
}

function calendarSetDate(date, action) {
	const index = calendarDates.findIndex(dateItem => compareDates(dateItem, date));
	if(action) {
		if(index > -1) calendarDatesElement.children[index].classList.add("calendarDaySelected");	
		calendarState.push({day: date, element: calendarDatesElement.children[index]})	
	}else {
		if(index > -1) { 
			calendarDatesElement.children[index].classList.remove("calendarDaySelected");
			calendarDatesElement.children[index].classList.remove("rangeSelect");
			calendarDatesElement.children[index].classList.remove("rangeSelectUser");
			calendarDatesElement.children[index].classList.remove("rangeSelectStart");
			calendarDatesElement.children[index].classList.remove("rangeSelectEnd");

		};
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
