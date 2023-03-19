require("dotenv").config();
const redis = require("redis");
const customer = redis.createClient({
    password: process.env.REDIS_PASSW,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});
(async () => {
    await customer.connect();
})();

customer.on("connect", function () {
    console.log("Redis is Connected!");
});

customer.on("error", (err) => {
    console.log("There's an error in the Redis Connection");
});
module.exports = customer;