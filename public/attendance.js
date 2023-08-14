const calendarDatesElement = document.querySelector(".calendarDates");
const calendarDateTextElement = document.querySelector(".calendarDateText");
const calendarDateNextElement = document.querySelector(".calendarDateNext");
const calendarDatePreviousElement = document.querySelector(".calendarDatePrevious");
const mainElement = document.querySelector(".main");
const attendanceElementTemplate = document.querySelector("#attendanceTemplate");
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

let userIdentifier = false;

if(userAdmin) {
	for(let param of new URLSearchParams(window.location.search)) {
		if(param[0] === "id") userIdentifier = param[1];
	}
}

console.log(userAdmin, userIdentifier);

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
	if(action) {
		const foundAttendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, date));
		let attendance;
		if(foundAttendanceIndex > -1) {
			const attendanceData = attendances[foundAttendanceIndex];
			attendance = createAttendance({date: date, status: attendanceData.status, checkbox: attendanceData.place, content: attendanceData.content});
		}else {
			attendance = createAttendance({date: date, status: 0 });
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
		mainElement.removeChild(contentState[index].element);
		contentState.splice(index, 1);
	}
}

function createAttendance({ date, status, checkbox, onClose, content } = {}) {
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
	const index = mainElement.children.length;

	let lastInput = attendanceElementCopy.querySelector(".attendanceInput");

	const inputCopy = lastInput.cloneNode(true);

	attendanceCheckboxCompanyCheck.style.display = "none";
	attendanceCheckboxSchoolCheck.style.display = "none";
	attendanceCheckboxCompanyBox.addEventListener("click", _event => checkCheckbox(attendanceCheckboxCompanyCheck, attendanceCheckboxSchoolCheck));
	attendanceCheckboxSchoolBox.addEventListener("click", _event => checkCheckbox(attendanceCheckboxSchoolCheck, attendanceCheckboxCompanyCheck));

	setContent(content);

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

				if(status < 2) {
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



		if(status < 2) {
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
		if(!event.srcElement.disabled) {
			const response = await fetch(`/attendance${userIdentifier ? `?id=${userIdentifier}` : ""}`, {
				method: "PUT",
				headers: { "Content-type": "application/json", Authorization: `token ${token}` },
				body: JSON.stringify({date})
			});
			const responseJson = await response.json();
			const attendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, date));
			attendances[attendanceIndex].status = 2;
			calendarDates = generateCalendarDates();
			setStatus(2);
			setContent(attendances[attendanceIndex].content);
		}
	});

	attendanceSaveElement.addEventListener("click", async event => {
		if(!event.srcElement.disabled) {
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
				status: 1
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
				setStatus(1);
				setContent(content);
			}
		}
	});

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

	mainElement.appendChild(attendanceElementCopy);

	function setStatus(newStatus) {
		status = newStatus;
		if(status == 0) {
			attendanceStatusElement.textContent = "Unsaved";
			attendanceStatusElement.style.opacity = 0.7;
			attendanceStatusElement.style.color = "var(--text-color)";
			attendanceSubmitElement.disabled = true;
			attendanceMoreElement.disabled = false;
			attendanceSaveElement.disabled = false;
		}else if(status == 1) {
			attendanceStatusElement.textContent = "Saved";
			attendanceStatusElement.style.color = "var(--text-color)";
			attendanceStatusElement.style.opacity = 1;
			attendanceSubmitElement.disabled = false;
			attendanceMoreElement.disabled = false;
			attendanceSaveElement.disabled = false;
		}else if(status == 2) {
			attendanceStatusElement.textContent = "Submited";
			attendanceStatusElement.style.color = "yellow";
			attendanceStatusElement.style.opacity = 1;
			attendanceSubmitElement.disabled = true;
			attendanceMoreElement.disabled = false;
			attendanceSaveElement.disabled = true;
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

	function checkCheckbox(primary, secondary) {
		if(primary.style.display === "none") {
			primary.style.display = null;
			if(secondary.style.display !== "none") {
				secondary.style.display = "none";
			}
		}else {
			primary.style.display = "none";
		}
	}

	function setDate(date) {
		attendanceDateElement.textContent = `${date.getDate()}. ${MonthsOfYear[date.getMonth()]} ${date.getFullYear()}`;
	}

	return {index, close: (callback) => {onClose = callback}, setDate};
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

		const foundAttendanceIndex = attendances.findIndex(attendance => compareDates(attendance.date, day));
		if(foundAttendanceIndex > -1) {
			switch(attendances[foundAttendanceIndex].status) {
				case 1: 
					calendarDateDayDotElement.classList.add("savedDate");
					break;
				case 2: 
					calendarDateDayDotElement.classList.add("submitedDate");
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
