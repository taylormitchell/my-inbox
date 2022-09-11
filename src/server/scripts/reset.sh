rm db/db.sqlite
cat db/init.sql | sqlite3 db/db.sqlite