import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import express, { query } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
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

	const user = await users.findOne({id: session.id});
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
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id });
	if(userRequest.role !== "admin")return res.json({error: {id: 5, message: "User not authorized"}});
	const params = req.query;
	const pageVisible = params.visible ? parseInt(params.visible) : 5;
	const pageNumber = params.page ? parseInt(params.page) : 0;
	const sort = params.sort;
	const sortParam = new Object();
	if(sort) sortParam[sort.toLowerCase()] = 1;

	const userLength = await users.countDocuments(); 

	const page = await users.find({}).skip(pageNumber * pageVisible).limit(pageVisible).sort(sort ? sortParam : {id: 1}).toArray();

	const pageLength = Math.floor(userLength / pageVisible) + (userLength % pageVisible != 0 ? 1 : 0);

	res.json({page, pageLength, userLength});
});

app.delete("/user", async (req, res) => {
	const data = req.query;
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id });
	if(userRequest.role !== "admin")return res.json({error: {id: 5, message: "User not authorized"}});
	if(typeof data !== "object" || data.id === undefined) return res.json({ error: { id: 0, message: "Invalid request" }});
	await sessions.deleteMany({id: data.id});
	await users.deleteOne({id: data.id});
	res.json({message: "ok"});
});

app.post("/user", async (req, res) => {
	const data = req.body;
	const token = req.headers.authorization.split(" ")[1];
	if(!token) return res.json({error: {id: 5, message: "User not authorized"}});
	const session = await sessions.findOne({ token });
	if(!session) return res.json({error: {id: 5, message: "User not authorized"}});
	const userRequest = await users.findOne({ id: session.id });
	if(userRequest.role !== "admin")return res.json({error: {id: 5, message: "User not authorized"}});
	if(typeof data !== "object" || data.username === undefined || data.email === undefined || data.password === undefined) return res.json({ error: { id: 0, message: "Invalid request" }});
	if(typeof data.username !== "string" || typeof data.email !== "string" || typeof data.password !== "string") return res.json({error: {id: 1, message: "Invalid type"}});
	if(data.username.length == 0 || data.email.length == 0 || data.password.length == 0) return res.json({error: {id: 2, message: "Empty values"}});

	const user = await users.findOne({ $or: [{ username: data.username }, {email: data.email}] });
	if(user) return res.json({ error: { id: 3, message: "User already exists" }});

	const passcode = bcrypt.hashSync(data.password, 10);

	const body = {id: nanoid(), username: data.username, email: data.email, password: passcode};
	if(data.class) body.class = data.class;
	if(data.role) body.role = data.role;
	users.insertOne(body); 
	res.json({ message: "ok" });
});


app.post("/register", async (req, res) => {
	const data = req.body;
	if(typeof data !== "object" || data.username === undefined || data.email === undefined || data.password === undefined) return res.json({ error: { id: 0, message: "Invalid request" }});
	if(typeof data.username !== "string" || typeof data.email !== "string" || typeof data.password !== "string") return res.json({error: {id: 1, message: "Invalid type"}});
	if(data.username.length == 0 || data.email.length == 0 || data.password.length == 0) return res.json({error: {id: 2, message: "Empty values"}});

	const user = await users.findOne({ $or: [{ username: data.username }, {email: data.email}] });
	if(user) return res.json({ error: { id: 3, message: "User already exists" }});

	const passcode = bcrypt.hashSync(data.password, 10);
	users.insertOne({id: nanoid(), username: data.username, email: data.email, password: passcode}); 
	res.json({ message: "ok" });
});

app.post("/login", async (req, res) => {
	const data = req.body;
	if(data.email === undefined || data.password === undefined) return res.json({error: { id: 0, message: "Invalid request" }});
	if(typeof data.email !== "string" || typeof data.password !== "string") return res.json({error: {id: 1, message: "Invalid type"}});
	if(data.email.length == 0 || data.password.length == 0) return res.json({error: {id: 2, message: "Empty values"}});

	const user = await users.findOne({email: data.email.toLowerCase()});
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
