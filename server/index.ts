import express =  require("express");
import http = require("http");
import { Server } from "socket.io";
import cors = require("cors");
import { disconnect } from "process";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

type Session = {
    id: string;
    owner: string;
    members: Set<string>;
    createdAt: number;
    lastActivity: number;
    nicknameMap: Map<string, string>;
    nextId: number;
};

const sessions: Map<string, Session> = new Map();
const socketToSession: Map<string, string> = new Map();

function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8);
}

function disconnectHelper(socketId: string): void {
        console.log("User disconnected:", socketId);
        const sessionId = socketToSession.get(socketId);
        if (!sessionId) return;
        const session = sessions.get(sessionId);
        if (!session) return;
        session.members.delete(socketId);
        session.nicknameMap.delete(socketId);
        socketToSession.delete(socketId);

        if (session.members.size === 0) {
            setTimeout(() => {
                if (session.members.size === 0) {
                    sessions.delete(sessionId);
                    console.log("Session emptied -- deleting.")
                }
            }, 10000);
        } else {
            io.to(sessionId).emit("send-members", Array.from(session.nicknameMap))
        }
}
function getSession(socketId: string): Session | void {
        const sessionId = socketToSession.get(socketId);
        if (!sessionId) return;
        const session = sessions.get(sessionId);
        return session;
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
            nextId: 1,
        };

        sessions.set(id, session);
        socket.emit("session-created", id);
        console.log(`Created session ${id}`);
    });

    socket.on("disconnect", () => {
        disconnectHelper(socket.id);
    });

    socket.on("join-session", (sessionId: string) => {
        console.log("joined session: " + socket.id);
        const session = sessions.get(sessionId);
        if (!session) {
            socket.emit("session-invalid");
            return;
        }

        socketToSession.set(socket.id, sessionId);
        session.members.add(socket.id);
        session.lastActivity = Date.now();
        session.nicknameMap.set(socket.id, `User ${session.nextId}`);
        session.nextId += 1;

        socket.join(sessionId);
        io.to(sessionId).emit("send-members", Array.from(session.nicknameMap));
    });

    socket.on("fetch-members", (sessionId: string) => {
        console.log(socket.id + " is fetching members")
        const session = sessions.get(sessionId);
        if (!session) return;
        io.to(sessionId).emit("send-members", Array.from(session.nicknameMap));
    });

    socket.on("leave-session", () => {
        disconnectHelper(socket.id);
    });

    socket.on("fetch-nickname", () => {
        const session = getSession(socket.id);
        if (!session) return;
        socket.emit("send-nickname", session.nicknameMap.get(socket.id));
    });

    socket.on("change-nickname", (newNickname: string) => {
        console.log(newNickname)
        const session = getSession(socket.id);
        if(!session) return;
        session.nicknameMap.set(socket.id, newNickname);
        io.to(session.id).emit("send-members", Array.from(session.nicknameMap));
    });

});

server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});