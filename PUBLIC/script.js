const socket = io();

const chatForm = document.querySelector(".chat-form");
const chatMessages = document.querySelector(".chat-window");

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;
    // emit message to server
    socket.emit("message", msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

const appendMessage = (messages) => {
    $(".chat-window").append(
        `<div class="chat-message ${messages.sender}">
            ${messages.info}
            <span class="time">${messages.time}</span>
        </div>`
    );
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const appendOrder = (messages, type) => {
    $(".chat-window").append(
        `<div class="chat-message ${messages.sender}">
            <p class="text menu">
                This is your ${type}
            </p>
            ${messages.info}
            <span class="time">${messages.time}</span>
        </div>`
    );
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

socket.on("createMessage", (messages) => {
    appendMessage(messages);
});

socket.on("SendMenu", (messages) => {
    appendMessage(messages);
});

socket.on("sendOrder", (messages) => {
    appendMessage(messages);
});