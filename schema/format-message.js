const moment = require("moment");

const formatMessage = (sender, msg, id) => {
    return {
        id: id,
        sender: sender,
        info: msg,
        time: moment().format("h:mm a"),
    };
};

module.exports = formatMessage;