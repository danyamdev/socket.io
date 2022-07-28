const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 8001;
const rooms = new Map();

app.use(cors());
app.use(express.json());

app.get("/rooms/:id", (req, res) => {
	const { id: roomId } = req.params;

	const data =
		rooms.has(roomId)
			? {
				users: [...rooms.get(roomId).get("users").values()],
				messages: [...rooms.get(roomId).get("messages").values()],
			}
			: { users: [], messages: [] };

	res.status(200).json(data);
});

app.post("/rooms", (req, res) => {
	const { roomId, name } = req.body;

	if (!rooms.has(roomId)) {
		rooms.set(roomId, new Map([
			["users", new Map()],
			["messages", []]
		]));
	}

	res.json([...rooms.keys()]);
});

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	socket.on("ROOM:JOIN", ({ userName, roomId }) => {
		socket.join(roomId);
		rooms.get(roomId).get("users").set(socket.id, userName);
		const users = [...rooms.get(roomId).get("users").values()];
		socket.broadcast.to(roomId).emit("ROOM:SET_USERS", users);
	});

	socket.on("ROOM:NEW_MESSAGE", ({ userName, roomId, text }) => {
		const obj = {
			userName,
			text
		};
		rooms.get(roomId).get("messages").push(obj);
		socket.broadcast.to(roomId).emit("ROOM:NEW_MESSAGE", obj);
	});

	socket.on("disconnect", () => {
		rooms.forEach(((value, roomId) => {
			if (value.get("users").delete(socket.id)) {
				const users = [...rooms.get(roomId).get("users").values()];
				socket.broadcast.to(roomId).emit("ROOM:SET_USERS", users);
			}
		}))
	})
})

server.listen(PORT, (err) => {
	if (err) {
		return new Error;
	}

	console.log("listening on *:8001");
})