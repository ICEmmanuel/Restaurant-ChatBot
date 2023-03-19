const customer = require("../customer");
const formatMessage = require("../schema/format-message");
const menuItems = require("./menu.json");

const getOldMessages = async (socket, sessionId, io) => {
    let messages = formatMessage("bot", "You're welcome to ICE restaurant", sessionId);
    let res = await customer.lRange(`messages:${sessionId}`, 0, -1);
    if (res.length === 0) {
        pushMessage(socket, sessionId, messages);
        sendMenu(socket, sessionId);
    } else {
        res.map((x) => {
            socket.emit("createMessage", JSON.parse(x));
        });
    }
};

const sendMenu = async (socket, sessionId) => {
    let insructions = menuItems["menuPrompts"];
    let finalMsg;
    let msg = "Select an option: <br> <br>";
    insructions.forEach((x) => {
        msg += `${x["id"]} -  ${x["prompt"]}<br> <br>`;
    });
    finalMsg = `<p class="text">
                    ${msg}
                </p>`;
    let messages = formatMessage("bot", finalMsg, sessionId);
    await customer.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
    socket.emit("SendMenu", messages);
};

const sendFoodMenu = async (socket, sessionId) => {
    let insructions = menuItems["availableFoodItems"];
    let msg = "Select an item to buy: <br> <br>";
    let finalMsg;
    insructions.forEach((x) => {
        msg += `${x["id"]} -  ${x["item"]} - &#8358;${x[
            "price"
        ].toLocaleString()}<br> <br>`;
    });
    finalMsg = `<p class="text">
                    ${msg}
                </p>`;

    let messages = formatMessage("bot", finalMsg, sessionId);
    await customer.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
    socket.emit("SendMenu", messages);
};

const pushMessage = (socket, sessionId, messages) => {
    customer.RPUSH(`messages:${sessionId}`, JSON.stringify(messages));
    socket.emit("createMessage", messages);
};

// sendMenu(876867);
module.exports = { getOldMessages, sendMenu, sendFoodMenu, pushMessage };