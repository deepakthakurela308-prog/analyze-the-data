const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new Database("analytics.db");

db.exec("CREATE TABLE IF NOT EXISTS sales ( id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL )");

const count = db.prepare("SELECT COUNT(*) AS total FROM sales").get();

if (count.total === 0) {
const insert = db.prepare(
"INSERT INTO sales (product, category, amount, date) VALUES (?, ?, ?, ?)"
);

const sampleData = [
["Laptop", "Electronics", 55000, "2026-01-10"],
["Phone", "Electronics", 25000, "2026-01-12"],
["Chair", "Furniture", 4500, "2026-01-15"],
["Desk", "Furniture", 8500, "2026-02-02"],
["Headphones", "Electronics", 2200, "2026-02-10"],
["Notebook", "Stationery", 150, "2026-02-15"]
];

const insertMany = db.transaction((rows) => {
for (const row of rows) insert.run(...row);
});

insertMany(sampleData);
}

app.get("/api/health", (req, res) => {
res.json({ status: "ok", message: "Analytics API is running" });
});

app.get("/api/sales", (req, res) => {
const sales = db.prepare("SELECT * FROM sales ORDER BY date DESC").all();
res.json(sales);
});

app.post("/api/sales", (req, res) => {
const { product, category, amount, date } = req.body;

if (
!product ||
!category ||
!date ||
amount === undefined ||
!Number.isFinite(Number(amount))
) {
return res.status(400).json({ error: "Please provide valid sales data." });
}

const result = db.prepare(
"INSERT INTO sales (product, category, amount, date) VALUES (?, ?, ?, ?)"
).run(product, category, Number(amount), date);

res.status(201).json({
id: result.lastInsertRowid,
product,
category,
amount: Number(amount),
date
});
});

app.listen(PORT, () => {
console.log("Analytics API running on port ${PORT}");
});
