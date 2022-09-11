import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import path from "path";

const dbFile = path.join(__dirname, "db/db.sqlite");

const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/", (req: Request, res: Response) => {
  const objects = req.body;
  if (!objects) {
    res.status(400).send("No objects provided");
  }

  const keys = Object.keys(objects);
  const values = Object.values(objects).map((v) => JSON.stringify(v));

  const sql =
    "INSERT OR REPLACE INTO object (key, value) VALUES " + keys.map((k) => "(?, ?)").join(", ");
  const params: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    params.push(keys[i]);
    params.push(values[i]);
  }

  const db = new sqlite3.Database(dbFile);
  db.run(sql, params, (err: any) => {
    if (err) res.status(500).send({ error: err });
    res.json({});
  });
});

router.get("/", (req: Request, res: Response) => {
  const objects = req.body;
  const keys = Object.keys(objects);
  const sql = "SELECT * FROM object WHERE key IN (" + keys.map((k) => "?").join(", ") + ")";
  const db = new sqlite3.Database(dbFile);
  db.all(sql, keys, (err: any, rows: any) => {
    if (err) res.status(500).send({ error: err });
    const objects: { [key: string]: any } = {};
    const meta: { [key: string]: any } = {};
    rows.forEach((row: any) => {
      objects[row.key] = JSON.parse(row.value);
      meta[row.key] = { ...row, value: undefined };
    });
    res.json({ objects, meta });
  });
});

router.get("/all", (req: Request, res: Response) => {
  const db = new sqlite3.Database(dbFile);
  db.all("select * from object", {}, (err: any, rows: any) => {
    if (err) res.status(500).send({ error: err });
    const objects: { [key: string]: any } = {};
    const meta: { [key: string]: any } = {};
    rows.forEach((row: any) => {
      objects[row.key] = JSON.parse(row.value);
      meta[row.key] = { ...row, value: undefined };
    });
    res.json({ objects, meta });
  });
});

router.get("/new", (req: Request, res: Response) => {
  const since = parseInt(req.query.since as string);
  const sql = "SELECT * FROM object WHERE updated_at > $since";
  const db = new sqlite3.Database(dbFile);
  db.all(sql, { $since: since }, (err: any, rows: any) => {
    if (err) res.status(500).send({ error: err });
    const objects: { [key: string]: any } = {};
    const meta: { [key: string]: any } = {};
    rows.forEach((row: any) => {
      objects[row.key] = JSON.parse(row.value);
      meta[row.key] = { ...row, value: undefined };
    });
    res.json({ objects, meta });
  });
});

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
