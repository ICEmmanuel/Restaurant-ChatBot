const {
    placeOrder,
    checkoutOrder,
    showOrderHistory,
    showCurrentOrder,
    cancelOrder,
} = require("./orders");
const formatMessage = require("../schema/format-message");
const { sendMenu, sendFoodMenu, pushMessage } = require("./messages");

const menuItems = require("./menu.json");

const handleUserPrompt = async (
    userPrompt,
    socket,
    client,
    sessionId,
    currentOrder
) => {
    switch (userPrompt) {
        case "1":
            return placeOrder(socket, sessionId);
        case "99":
            return checkoutOrder(socket, client, sessionId, currentOrder);
        case "98":
            return await showOrderHistory(socket, client, sessionId);
        case "97":
            return showCurrentOrder(socket, sessionId, currentOrder);
        case "0":
            return cancelOrder(socket, sessionId, currentOrder);
        default:
            let validPrompts = availableFoodItems["menuPrompts"].map(function (n) {
                return n.id.toString();
            });
            if (!validPrompts.includes(userPrompt)) {
                let botMessage = formatMessage(
                    "bot",
                    "Invalid Input",
                    sessionId
                );
                pushMessage(socket, sessionId, botMessage);
                sendMenu(socket, sessionId);
            }
            return [true, false];
    }
};

const handleUserOrder = (userPrompt, socket, sessionId, currentOrder) => {
    let foodMenu;
    let mainMenu;
    let totalPrice;
    let validPrompts = availableFoodItems["availableFoodItems"].map(function (n) {
        return n.id.toString();
    });
    let currentOrderItems = currentOrder.items;
    currentOrder["totalPrice"] = 0;
    if (!validPrompts.includes(userPrompt)) {
        let botMessage = formatMessage("bot", "Invalid Input", sessionId);
        pushMessage(socket, sessionId, botMessage);
        sendFoodMenu(socket, sessionId);
        mainMenu = false;
        foodMenu = true;
        return [mainMenu, foodMenu];
    } else {
        const selectedItem = availableFoodItems["availableFoodItems"].find(
            (item) => item.id == userPrompt
        );
        let id = selectedItem.id;
        if (id in currentOrderItems) {
            currentOrderItems[id].quantity += 1;
            currentOrderItems[id].price += selectedItem.price;
        } else {
            currentOrderItems[id] = { ...selectedItem };
            currentOrderItems[id].quantity = 1;
        }
        for (let key in currentOrderItems) {
            currentOrder["totalPrice"] += currentOrderItems[key].price;
        }
        let botMessage = formatMessage(
            "bot",
            `1 ${selectedItem.item} has been added to your current order`,
            sessionId
        );
        pushMessage(socket, sessionId, botMessage);
        sendMenu(socket, sessionId);
        mainMenu = true;
        foodMenu = false;
        return [mainMenu, foodMenu];
    }
};

module.exports = { handleUserPrompt, handleUserOrder };