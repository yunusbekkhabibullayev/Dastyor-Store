const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const sequence = [
  { id: 'cosmetics', order: 1 },
  { id: 'flowers', order: 2 },
  { id: 'men', order: 3 },
  { id: 'women', order: 4 },
  { id: 'electronics', order: 5 },
  { id: 'book', order: 6 },
  { id: 'kitoblar', order: 6 }
];

db.serialize(() => {
  for (const item of sequence) {
    db.run("UPDATE categories SET sort_order = ? WHERE id = ?", [item.order, item.id], function(err) {
      if (err) {
        console.error(`Failed to update ${item.id}:`, err.message);
      } else {
        console.log(`Updated ${item.id} to sort_order = ${item.order}`);
      }
    });
  }
});

setTimeout(() => db.close(), 1500);
