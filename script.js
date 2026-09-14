const socket = io();

const joinScreen = document.getElementById("joinScreen");
const chatScreen = document.getElementById("chatScreen");

const roomInput = document.getElementById("roomCode");
const joinButton = document.getElementById("joinButton");
const joinError = document.getElementById("joinError");

const status = document.getElementById("status");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

let joinedRoom = false;


joinButton.addEventListener("click", () => {
    const roomCode = roomInput.value.trim();

    joinError.textContent = "";

    if (roomCode === "") {
        joinError.textContent = "Please enter a Room Code.";
        return;
    }

    socket.emit("joinRoom", roomCode);
});


roomInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        joinButton.click();
    }
});


socket.on("joinedRoom", (roomCode) => {
    joinedRoom = true;

    joinScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");

    status.textContent = "Waiting for second person...";
});


socket.on("waiting", () => {
    status.textContent = "Waiting for second person...";
});


socket.on("roomReady", () => {
    status.textContent = "Both connected. Start chatting!";
});


socket.on("roomFull", () => {
    joinError.textContent = "This room already has 2 people.";
});


socket.on("joinError", (errorMessage) => {
    joinError.textContent = errorMessage;
});


sendButton.addEventListener("click", sendMessage);


messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});


function sendMessage() {
    if (!joinedRoom) {
        return;
    }

    const text = messageInput.value.trim();

    if (text === "") {
        return;
    }

    socket.emit("sendMessage", text);

    messageInput.value = "";
    messageInput.focus();
}


socket.on("message", (message) => {
    const messageElement = document.createElement("div");

    messageElement.classList.add("message");

    if (message.senderId === socket.id) {
        messageElement.classList.add("myMessage");
    } else {
        messageElement.classList.add("otherMessage");
    }

    messageElement.textContent = message.text;

    messages.appendChild(messageElement);

    messages.scrollTop = messages.scrollHeight;
});


socket.on("partnerDisconnected", () => {
    status.textContent = "The other person disconnected.";
});
