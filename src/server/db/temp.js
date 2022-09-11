const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbFile = path.join(__dirname, "db.sqlite");

const notes = JSON.parse(fs.readFileSync("notes.json"));

const objects = {};
notes.forEach((note) => {
  objects[note.id] = note;
});

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
});
