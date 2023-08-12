const token = localStorage.getItem("token");
if(!token) {
	window.location = "/login.html";
}else {
	window.location = "/attendance.html";
}
