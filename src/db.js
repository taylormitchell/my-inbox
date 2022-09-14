const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbFile = path.join(__dirname, "db/db.sqlite");

const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/", (req, res) => {
  const objects = req.body;
  if (!objects) {
    res.status(400).send("No objects provided");
  }

  const keys = Object.keys(objects);
  const values = Object.values(objects).map((v) => JSON.stringify(v));

  const sql =
    "INSERT OR REPLACE INTO object (key, value) VALUES " + keys.map((k) => "(?, ?)").join(", ");
  const params = [];
  for (let i = 0; i < keys.length; i++) {
    params.push(keys[i]);
    params.push(values[i]);
  }

  const db = new sqlite3.Database(dbFile);
  db.run(sql, params, (err) => {
    if (err) res.status(500).send({ error: err });
    res.json({});
  });
});

router.get("/", (req, res) => {
  const objects = req.body;
  const keys = Object.keys(objects);
  const sql = "SELECT * FROM object WHERE key IN (" + keys.map((k) => "?").join(", ") + ")";
  const db = new sqlite3.Database(dbFile);
  db.all(sql, keys, (err, rows) => {
    if (err) res.status(500).send({ error: err });
    const objects = {};
    const meta = {};
    rows.forEach((row) => {
      objects[row.key] = JSON.parse(row.value);
      meta[row.key] = { ...row, value: undefined };
    });
    res.json({ objects, meta });
  });
});

router.get("/all", (req, res) => {
  const db = new sqlite3.Database(dbFile);
  db.all("select * from object", {}, (err, rows) => {
    if (err) res.status(500).send({ error: err });
    const objects = {};
    const meta = {};
    rows.forEach((row) => {
      objects[row.key] = JSON.parse(row.value);
      meta[row.key] = { ...row, value: undefined };
    });
    res.json({ objects, meta });
  });
});

router.get("/new", (req, res) => {
  const since = parseInt(req.query.since);
  const sql = "SELECT * FROM object WHERE updated_at > $since";
  const db = new sqlite3.Database(dbFile);
  db.all(sql, { $since: since }, (err, rows) => {
    if (err) res.status(500).send({ error: err });
    const objects = {};
    const meta = {};
    rows.forEach((row) => {
      objects[row.key] = JSON.parse(row.value);
      meta[row.key] = { ...row, value: undefined };
    });
    res.json({ objects, meta });
  });
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
