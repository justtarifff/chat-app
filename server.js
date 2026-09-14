const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (roomCode) => {
        const code = roomCode.trim().toUpperCase();

        if (!code) {
            socket.emit("joinError", "Please enter a Room Code.");
            return;
        }

        let room = rooms.get(code);

        if (!room) {
            room = new Set();
            rooms.set(code, room);
        }

        if (room.size >= 2) {
            socket.emit("roomFull");
            return;
        }

        socket.join(code);
        socket.data.roomCode = code;
        room.add(socket.id);

        socket.emit("joinedRoom", code);

        if (room.size === 1) {
            socket.emit("waiting");
        } else {
            io.to(code).emit("roomReady");
        }

        console.log(`${socket.id} joined room ${code}`);
    });

    socket.on("sendMessage", (message) => {
        const code = socket.data.roomCode;

        if (!code) {
            return;
        }

        const cleanMessage = String(message).trim();

        if (!cleanMessage) {
            return;
        }

        io.to(code).emit("message", {
            text: cleanMessage,
            senderId: socket.id
        });
    });

    socket.on("disconnect", () => {
        const code = socket.data.roomCode;

        if (!code) {
            console.log("User disconnected:", socket.id);
            return;
        }

        const room = rooms.get(code);

        if (room) {
            room.delete(socket.id);

            if (room.size === 0) {
                rooms.delete(code);
            } else {
                io.to(code).emit("partnerDisconnected");
            }
        }

        console.log("User disconnected:", socket.id);
    });
});

server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log("Server running");
});