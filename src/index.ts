import express from "express";
import db from "./server/db";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3030;

const app = express();
app.use("/", express.static("client/build"));
app.use("/api/db", db);
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
