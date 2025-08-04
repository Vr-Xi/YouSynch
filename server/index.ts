import express =  require("express");
import http = require("http");
import { Server } from "socket.io";
import cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    // cors: { origin: "*" },
    cors: {
        origin: "http://localhost:5173", // or whatever your React dev URL is
        methods: ["GET", "POST"],
        credentials: true
    }
});

type Session = {
    id: string;
    owner: string;
    members: Set<string>;
    createdAt: number;
    lastActivity: number;
    nicknameMap: Map<string, string>;
};

const sessions: Map<string, Session> = new Map();

function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8);
}

io.on("connection", (socket) => {
    console.log("User connect: " + socket.id);

    socket.on("create-session", () => {
        let id = generateSessionId();
        while (sessions.has(id)) {
            id = generateSessionId();
        }

        const session: Session = {
            id: id,
            owner: socket.id,
            members: new Set([socket.id]),
            createdAt: Date.now(),
            lastActivity: Date.now(),
            nicknameMap: new Map([[socket.id, "User 1"]]),
        };

        sessions.set(id, session);
        socket.emit("session-created", id);
        console.log(`Created session ${id}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});

app.get("/ping", (req, res) => {
  res.send("Pong from backend");
});