let pageVisible = 5;
let pageNumber = 0;

async function getUsers(pageVisible, pageNumber) {
	const request = await fetch("/users");
	const requestJson = await request.json();
	return requestJson;
}

const userList = await getUsers(pageVisible, pageNumber);

console.log(userList);
