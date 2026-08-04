const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.run("ALTER TABLE site_settings ADD COLUMN admin_ids TEXT DEFAULT ''", (err) => {
  if (err) console.error("Error 1:", err.message);
  else console.log("admin_ids added successfully");
  
  db.run("ALTER TABLE site_settings ADD COLUMN bts_delivery_price INTEGER DEFAULT 50000", (err2) => {
    if (err2) console.error("Error 2:", err2.message);
    else console.log("bts_delivery_price added successfully");
    db.close();
  });
});
