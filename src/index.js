const express = require("express");
const db = require("./db");

const port = process.env.PORT || 3002;

const app = express();
app.use("/", express.static("client/build"));
app.use("/api/db", db);
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
