const express = require("express");
require("dotenv").config();
const db = require("./db");

const port = process.env.PORT || 3002;
const env = process.env.NODE_ENV || "development";

const app = express();
if (env === "production") {
  app.use("/", express.static("client/build"));
}
app.use("/api/db", db);
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
