const express = require("express");
const axios = require("axios");
const redis = require("redis");
const app = express();
const PORT = process.env.PORT || 9000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

client.on("connect", () =>
  console.log(`Redis is connected on port ${REDIS_PORT}`)
);
client.on("error", (error) => console.error(error));

app.get("/", (req, res) => {
  const url = "url";
  try {
    client.get("respondData", async (err, cache_data) => {
      if (cache_data) {
        return res.status(200).send({
          message: `Retrieved ${cache_data}'s data from the cache`,
          users: JSON.parse(cache_data),
        });
      } else {
        const api = await axios.get(url);
        client.setex("respondData", 1440, JSON.stringify(api.data));
        return res.status(200).send({
          message: `Retrieved ${api.data}'s data from the server`,
          users: api.data,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
