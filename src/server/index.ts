import express from "express";
import db from "./db";

const port = process.env.PORT || 3001;

const app = express();
app.use("/api/db", db);
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
