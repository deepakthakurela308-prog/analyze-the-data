import React, { useEffect, useMemo, useState } from "react";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
ArcElement,
Tooltip,
Legend
);

const demoData = [
{ id: 1, product: "Laptop", category: "Electronics", amount: 55000, date: "2026-01-10" },
{ id: 2, product: "Phone", category: "Electronics", amount: 25000, date: "2026-01-12" },
{ id: 3, product: "Chair", category: "Furniture", amount: 4500, date: "2026-01-15" },
{ id: 4, product: "Desk", category: "Furniture", amount: 8500, date: "2026-02-02" },
{ id: 5, product: "Headphones", category: "Electronics", amount: 2200, date: "2026-02-10" },
{ id: 6, product: "Notebook", category: "Stationery", amount: 150, date: "2026-02-15" }
];

function App() {
const [sales, setSales] = useState(demoData);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

useEffect(() => {
fetch("/api/sales")
.then((response) => {
if (!response.ok) throw new Error("API unavailable");
return response.json();
})
.then((data) => {
if (Array.isArray(data) && data.length > 0) setSales(data);
})
.catch(() => {
setMessage("Demo data is being shown. Start the API to load database data.");
});
}, []);

const categories = ["All", ...new Set(sales.map((item) => item.category))];

const filteredSales = useMemo(() => {
return sales.filter((item) => {
const matchesSearch = item.product.toLowerCase().includes(search.toLowerCase());
const matchesCategory = category === "All" || item.category === category;
return matchesSearch && matchesCategory;
});
}, [sales, search, category]);

const total = filteredSales.reduce((sum, item) => sum + Number(item.amount), 0);
const average = filteredSales.length ? total / filteredSales.length : 0;

const categoryTotals = {};
filteredSales.forEach((item) => {
categoryTotals[item.category] =
(categoryTotals[item.category] || 0) + Number(item.amount);
});

const barData = {
labels: Object.keys(categoryTotals),
datasets: [
{
label: "Sales Amount (₹)",
data: Object.values(categoryTotals),
backgroundColor: ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899"]
}
]
};

const pieData = {
labels: Object.keys(categoryTotals),
datasets: [
{
data: Object.values(categoryTotals),
backgroundColor: ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899"]
}
]
};

function importCSV(event) {
const file = event.target.files[0];
if (!file) return;

setLoading(true);
const reader = new FileReader();

reader.onload = (e) => {
  try {
    const lines = String(e.target.result).trim().split(/\r?\n/);
    const rows = lines.slice(1).map((line, index) => {
      const columns = line.split(",").map((value) => value.trim());
      return {
        id: Date.now() + index,
        product: columns[0],
        category: columns[1],
        amount: Number(columns[2]),
        date: columns[3]
      };
    }).filter((item) =>
      item.product &&
      item.category &&
      Number.isFinite(item.amount) &&
      item.date
    );

    if (!rows.length) {
      setMessage("CSV format: product,category,amount,date");
    } else {
      setSales(rows);
      setMessage(`${rows.length} rows imported successfully.`);
    }
  } catch {
    setMessage("Could not read this CSV file.");
  } finally {
    setLoading(false);
  }
};

reader.onerror = () => {
  setMessage("Could not read this CSV file.");
  setLoading(false);
};

reader.readAsText(file);
event.target.value = "";

}

function exportCSV() {
const header = "product,category,amount,date";
const rows = filteredSales.map((item) =>
[item.product, item.category, item.amount, item.date]
.map((value) => ""${String(value).replace(/"/g, '""')}"")
.join(",")
);

const blob = new Blob([[header, ...rows].join("\n")], {
  type: "text/csv;charset=utf-8;"
});
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "analytics-report.csv";
link.click();
URL.revokeObjectURL(url);

}

return (
<main className="app">
<header className="topbar">
<div>
<p className="eyebrow">DATA INTELLIGENCE</p>
<h1>Analyze the Data</h1>
<p className="subtitle">Your sales insights, all in one place.</p>
</div>
<span className="live-badge">● Analytics Dashboard</span>
</header>

  {message && <p className="notice">{message}</p>}

  <section className="toolbar">
    <input
      type="search"
      placeholder="Search products..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      aria-label="Search products"
    />

    <select
      value={category}
      onChange={(event) => setCategory(event.target.value)}
      aria-label="Filter by category"
    >
      {categories.map((item) => (
        <option key={item} value={item}>{item}</option>
      ))}
    </select>

    <label className="button secondary">
      {loading ? "Importing..." : "Import CSV"}
      <input type="file" accept=".csv,text/csv" onChange={importCSV} hidden />
    </label>

    <button className="button primary" onClick={exportCSV}>
      Export CSV
    </button>
  </section>

  <section className="stats">
    <article className="stat-card">
      <span>Total Sales</span>
      <strong>₹{total.toLocaleString("en-IN")}</strong>
      <small>For filtered records</small>
    </article>
    <article className="stat-card">
      <span>Total Records</span>
      <strong>{filteredSales.length}</strong>
      <small>Sales entries</small>
    </article>
    <article className="stat-card">
      <span>Average Sale</span>
      <strong>₹{Math.round(average).toLocaleString("en-IN")}</strong>
      <small>Average per record</small>
    </article>
  </section>

  <section className="charts">
    <article className="panel">
      <h2>Sales by Category</h2>
      <div className="chart-area">
        <Bar
          data={barData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }}
        />
      </div>
    </article>

    <article className="panel">
      <h2>Category Breakdown</h2>
      <div className="pie-area">
        <Pie
          data={pieData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </article>
  </section>

  <section className="panel table-panel">
    <div className="table-heading">
      <div>
        <h2>Sales Records</h2>
        <p>Review and explore your data.</p>
      </div>
      <span>{filteredSales.length} records</span>
    </div>

    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.map((item) => (
            <tr key={item.id}>
              <td>{item.product}</td>
              <td><span className="category-pill">{item.category}</span></td>
              <td>₹{Number(item.amount).toLocaleString("en-IN")}</td>
              <td>{item.date}</td>
            </tr>
          ))}
          {filteredSales.length === 0 && (
            <tr>
              <td colSpan="4" className="empty">No matching records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>

  <footer>Analyze the Data · Data-driven decisions made simple</footer>
</main>

);
}

export default App;
