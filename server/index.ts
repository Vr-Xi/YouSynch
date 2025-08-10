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
    deletionTimer?: NodeJS.Timeout;
    videoId?: string;
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
            if (session.deletionTimer) {
                clearTimeout(session.deletionTimer);
            }

            session.deletionTimer = setTimeout(() => {
                if (session.members.size === 0) { // still empty
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
            videoId: "2H0r81kv5GA",
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

        if (session.deletionTimer) {
            clearTimeout(session.deletionTimer);
            delete session.deletionTimer;
        }

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
        if (!session) return;
        session.nicknameMap.set(socket.id, newNickname);
        session.nextId -= 1;
        io.to(session.id).emit("send-members", Array.from(session.nicknameMap));
    });

    socket.on("get-video", (sessionId) => {
        // console.log("attempting video get request");
        const session = sessions.get(sessionId);
        if (!session) return;
        // console.log("Video get request received")
        io.to(socket.id).emit("send-video", session.videoId);
    });

    socket.on("load-request", (video: string) => {
        console.log("--Session-wide order requested")
        const session = getSession(socket.id);
        if (!session) return;
        if (video === session.videoId) return;
        session.videoId = video;
        console.log("--Session-wide order should be live")
        io.to(session.id).emit("load-order", session.videoId);
    });

});

server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});