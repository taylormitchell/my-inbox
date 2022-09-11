import express from "express";
import db from "./server/db";

const port = process.env.PORT || 3001;

const app = express();
app.use("/", express.static("client/build"));
app.use("/api/db", db);
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
