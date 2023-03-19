const path = require("path");
const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const client = require("./customer");
const { handleUserPrompt, handleUserOrder } = require("./UTILITY/menu");
const { getOldMessages, sendMenu, pushMessage } = require("./UTILITY/messages");
const formatMessage = require("./schema/format-message");

const app = express();
const sessionMiddleware = session({
    secret: "mysessionmiddlewaresecret",
    cookie: { httpOnly: true, expires: 1000 * 60 * 60 * 24 * 7 },
    resave: true,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
require("dotenv").config();

PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.render("room");
});

const wrap = (sessionMiddleware) => (socket, next) =>
    sessionMiddleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
let foodMenu = false;
let mainMenu = true;

io.on("connection", async (socket) => {
    const session = socket.request.session;
    const sessionId = session.id;
    socket.join(sessionId);
    getOldMessages(socket, sessionId);
    let currentOrder = { items: {}, totalPrice: 0 };

    socket.on("message", async (messages) => {
        let userMessage = formatMessage("user", messages, sessionId);
        client.RPUSH(`messages:${session.id}`, JSON.stringify(userMessage));
        io.to(sessionId).emit("createMessage", userMessage);

        let botMessage = "";

        let userPrompt = messages;
        if (mainMenu) {
            // If main menu is the last bot message, collect user response
            [mainMenu, foodMenu] = await handleUserPrompt(
                userPrompt,
                socket,
                client,
                sessionId,
                currentOrder
            );
        } else if (foodMenu) {
            // if the food menu is the last bot message, collect user response for item
            [mainMenu, foodMenu] = handleUserOrder(
                userPrompt,
                socket,
                sessionId,
                currentOrder
            );
        }
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});