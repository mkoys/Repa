import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";

const app = express();

const rootFolder = new URL("./", import.meta.url).pathname;

const accessLogStream = fs.createWriteStream(path.join(rootFolder ,'access.log'), { flags: 'a' });

app.use(cors());
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.json());
app.use(express.static("public"));

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000");
const database = mongoClient.db("repa");
const users = database.collection("users");
const sessions = database.collection("sessions");
const attendances = database.collection("attendances");

try { mongoClient.connect() }
catch (error) { throw new Error("Couldn`t connect to database") }

app.get("/user", async (req, res) => {
	const removeKeys = ["password", "_id"];
	const notAuthorized = {error: {id: 5, message: "User not authorized"}};

	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json(notAuthorized);

	const session = await sessions.findOne({ token });
	if(!session) return res.json(notAuthorized);

	const user = await users.findOne({id: session.id, deleted: {$exists: false}});
	if(!user) return res.json({error: {id: 6, message: "User not found"}});

	Object.keys(user).forEach(key => {
		if(removeKeys.findIndex(removeKey => removeKey === key) > -1) delete user[key];
	});

	res.json({ ...user});
});

app.get("/users", async (req, res) => {
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 6, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id, deleted: {$exists: false} });
	if(userRequest.role !== "admin")return res.json({error: {id: 7, message: "User not authorized"}});
	const params = req.query;
	const pageVisible = params.visible ? parseInt(params.visible) : 5;
	const pageNumber = params.page ? parseInt(params.page) : 0;
	const sort = params.sort;
	const filterParam = new Object();
	const sortParam = new Object();
	if(userRequest.autoFilter) Object.keys(userRequest.autoFilter).forEach(key => filterParam[key] = userRequest.autoFilter[key]);
	if(sort) sortParam[sort.toLowerCase()] = 1;
	Object.keys(params).forEach(param => {
		if(param === "visible") return;
		if(param === "page") return;
		if(param === "sort") return;
		filterParam[param] = params[param];
	});

	filterParam.deleted = { $exists: false };

	const userLength = await users.countDocuments(filterParam); 

	const page = await users.find({$or: [filterParam, {id: userRequest.id}]}).skip(pageNumber * pageVisible).limit(pageVisible).sort(sort ? sortParam : {id: 1}).toArray();

	const pageLength = Math.floor(userLength / pageVisible) + (userLength % pageVisible != 0 ? 1 : 0);

	res.json({page, pageLength, userLength});
});

app.delete("/user", async (req, res) => {
	const data = req.query;
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id, deleted: {$exists: false} });
	if(userRequest.role !== "admin")return res.json({error: {id: 5, message: "User not authorized"}});
	if(typeof data !== "object" || data.id === undefined) return res.json({ error: { id: 0, message: "Invalid request" }});
	await sessions.deleteMany({id: data.id});
	await users.updateOne({id: data.id}, {$set: {deleted: { by: session.id, stamp: new Date() }}});
	res.json({message: "ok"});
});

app.post("/user", async (req, res) => {
	const data = req.body;
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id, deleted: {$exists: false} });
	if(userRequest.role !== "admin")return res.json({error: {id: 5, message: "User not authorized"}});
	if(typeof data !== "object" || data.username === undefined || data.email === undefined || data.password === undefined) return res.json({ error: { id: 0, message: "Invalid request" }});
	if(typeof data.username !== "string" || typeof data.email !== "string" || typeof data.password !== "string") return res.json({error: {id: 1, message: "Invalid type"}});
	if(data.username.length == 0 || data.email.length == 0 || data.password.length == 0) return res.json({error: {id: 2, message: "Empty values"}});

	const user = await users.findOne({ $or: [{ username: data.username, deleted: {$exists: false} }, {email: data.email, deleted: {$exists: false}}] });
	if(user) return res.json({ error: { id: 3, message: "User already exists" }});

	const passcode = bcrypt.hashSync(data.password, 10);

	const body = {id: nanoid(), firstname: data.firstname, surname: data.surname, username: data.username, email: data.email, password: passcode};
	if(data.class) body.class = data.class;
	if(data.firstname) body.firstname = data.firstname;
	if(data.surname) body.surname = data.surname;
	if(data.role) body.role = data.role;
	if(data.autoFilter) body.autoFilter = data.autoFilter;

	users.insertOne(body); 
	res.json({ message: "ok" });
});

app.put("/user", async (req, res) => {
	const data = req.body;
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id, deleted: {$exists: false} });
	if(userRequest.role !== "admin")return res.json({error: {id: 5, message: "User not authorized"}});
	if(typeof data !== "object") return res.json({ error: { id: 0, message: "Invalid request" }});

	let edit = {};
	let unset = {};
	if(data.username) edit.username = data.username;
	if(data.surname) edit.surname = data.surname;
	if(!data.surname) unset.surname = "";
	if(data.firstname) edit.firstname = data.firstname;
	if(!data.firstname) unset.firstname = "";
	if(data.autoFilter) edit.autoFilter = data.autoFilter;
	if(!data.autoFilter) unset.autoFilter = "";
	if(data.email) edit.email = data.email;
	if(data.class) edit.class = data.class;
	if(!data.class) unset.class = "";
	if(data.role) edit.role = "admin";
	if(!data.role) unset.role = "";

	users.updateOne({ id: data.id }, { $set: edit, $unset: unset });

	res.json({ message: "ok" });
});


app.post("/register", async (req, res) => {
	const data = req.body;
	if(typeof data !== "object" || data.username === undefined || data.email === undefined || data.password === undefined) return res.json({ error: { id: 0, message: "Invalid request" }});
	if(typeof data.username !== "string" || typeof data.email !== "string" || typeof data.password !== "string") return res.json({error: {id: 1, message: "Invalid type"}});
	if(data.username.length == 0 || data.email.length == 0 || data.password.length == 0) return res.json({error: {id: 2, message: "Empty values"}});

	const user = await users.findOne({ $or: [{ username: { $regex: new RegExp("^" + data.username.toLowerCase() + "$", "i") }, deleted: {$exists: false} }, {email: data.email.toLowerCase(), deleted: {$exists: false}}] });
	if(user) return res.json({ error: { id: 3, message: "User already exists" }});

	const passcode = bcrypt.hashSync(data.password, 10);
	users.insertOne({id: nanoid(), username: data.username, email: data.email.toLowerCase(), password: passcode, created: new Date()}); 
	res.json({ message: "ok" });
});

app.post("/login", async (req, res) => {
	const data = req.body;
	if(data.password === undefined || !data.username && !data.email) return res.json({error: { id: 0, message: "Invalid request" }});
	if(typeof data.email !== "string" && typeof data.username !== "string" || typeof data.password !== "string") return res.json({error: {id: 1, message: "Invalid type"}});
	if(data.email?.length == 0 && data.username?.length == 0 || data.password.length == 0) return res.json({error: {id: 2, message: "Empty values"}});

	const credentails = new Object();
	if(data.email) credentails.email = data.email.toLowerCase();
	if(data.username) credentails.username = {$regex: new RegExp("^" + data.username.toLowerCase() + "$","i")}
	credentails.deleted = {$exists: false};

	const user = await users.findOne(credentails);
	if(!user) return res.json({error: { id: 4, message: "Invalid credentials" }});

	const match = bcrypt.compareSync(data.password, user.password);
	if(!match) return res.json({error: { id: 4, message: "Invalid credentials" }});

	const token = nanoid();
	sessions.insertOne({ id: user.id, token });
	res.json({ token });
});

app.get("/logout", async (req, res) => {
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	
	await sessions.deleteOne({ token });
	res.json({ message: "ok" });
});

app.get("/attendance", async (req, res) => {
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	if(req.query.id) {
		const attendancesResult = await attendances.find({user: req.query.id}).toArray()
		if(!attendancesResult) return res.json({error: {id: 7, message: "User not found"}});
		res.json(attendancesResult);
	}else {
		const attendancesResult = await attendances.find({user: session.id}).toArray()
		res.json(attendancesResult);
	}
});

app.put("/attendance", async (req, res) => {
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});

	const data = req.body;
	if(!data || !data.date) return res.json({error: { id: 0, message: "Invalid request" }});
	const date = new Date(data.date);
	let updateAttendance = {};

	if(req.query.id) {
		updateAttendance = await attendances.updateOne({user: req.query.id, date}, {$set: { status: req.query.status ? parseInt(req.query.status) : 2 }});
	}else {
		updateAttendance = await attendances.updateOne({user: session.id, date}, {$set: { status: req.query.status ? parseInt(req.query.status) : 2 }});
	}

	if(updateAttendance.modifiedCount == 0) return res.json({error: {id: 10, message: "No saved attendance"}});
	res.json({message: "ok"});
});

app.post("/attendance", async (req, res) => {
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});

	const data = req.body;

	const user = await users.findOne({ id: session.id });

	if(data.place === undefined || data.content === undefined || data.status === undefined || data.date === undefined) {
		return res.json({error: { id: 0, message: "Invalid request" }});
	}

	if(!Array.isArray(data.content) || typeof data.place !== "number" || typeof data.status !== "number" || typeof data.date !== "string") {
		return res.json({error: {id: 1, message: "Invalid type"}});
	}

	let foundAttendance = null;

	if(req.query.id) {
		foundAttendance = await attendances.findOne({ user: req.query.id, date: new Date(data.date)  });
	}else {
		foundAttendance = await attendances.findOne({ user: user.id, date: new Date(data.date)  });
	}

	if(foundAttendance) {
		attendances.updateOne({id: foundAttendance.id}, {
			$set: {
				content: data.content,
				place: data.place,
				status: data.status
			}
		});
	}else {
		attendances.insertOne({
			id: nanoid(),
			name: req.query.username ? req.query.username : user.username,
			user: req.query.id ? req.query.id : user.id,
			date: new Date(data.date),
			content: data.content,
			place: data.place,
			status: data.status
		});
	}

	res.json({ message: "ok" });
});

const port = 3000;

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
