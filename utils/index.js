const KEY = "agenda-items-v1";
let items = [];
try {
    items = JSON.parse(localStorage.getItem(KEY) || "[]");
} catch (e) {
    items = [];
}

let selectedLevel = "medium";
const todoInput = document.getElementById("taskInput");
const todoListEl = document.getElementById("todoList");
const doneListEl = document.getElementById("doneList");
const todoCount = document.getElementById("todoCount");
const doneCount = document.getElementById("doneCount");

function todayISO() {
    const d = new Date();
    return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
    );
}
function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    });
}
function formatShort(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

document.getElementById("dateNow").textContent = formatDate(todayISO());

document.querySelectorAll(".pbtn").forEach((btn) => {
    btn.addEventListener("click", () => {
    document
    .querySelectorAll(".pbtn")
    .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedLevel = btn.dataset.level;
    });
});

function save() {
    try {
    localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {}
}

function addItem() {
    const text = todoInput.value.trim();
    if (!text) return;
    items.push({
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    text,
    level: selectedLevel,
    date: todayISO(),
    done: false,
    });
    todoInput.value = "";
    save();
    render();
}
document.getElementById("submitBtn").addEventListener("click", addItem);

function levelLabel(l) {
    return l === "low" ? "Low" : l === "high" ? "High" : "Medium";
}

function escapeHtml(s) {
    return s.replace(
    /[&<>"']/g,
    (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
    ],
    );
}

function render() {
    const today = todayISO();
    const pending = items.filter((i) => !i.done);
    const done = items.filter((i) => i.done);

    todoCount.textContent = pending.length + " tugas";
    doneCount.textContent = done.length + " selesai";

    todoListEl.innerHTML = pending.length
    ? ""
    : '<div class="empty">Belum ada tugas. Tambahkan agenda di atas.</div>';
    pending.sort((a, b) => a.date.localeCompare(b.date));
    pending.forEach((item) => {
    const overdue = item.date < today;
    const row = document.createElement("div");
    row.className = "item" + (overdue ? " overdue" : "");
    row.innerHTML = `
    <div class="check" data-id="${item.id}"></div>
    <div class="item-body">
        <div class="task-text">${escapeHtml(item.text)}</div>
        <div class="meta">
        <span class="badge ${item.level}">${levelLabel(item.level)}</span>
        ${overdue ? '<span class="badge overdue">Terlambat</span>' : ""}
        <span class="date-tag">${formatShort(item.date)}</span>
        </div>
    </div>
    <button class="del" data-del="${item.id}" aria-label="Hapus">✕</button>
    `;
    todoListEl.appendChild(row);
    });

    doneListEl.innerHTML = done.length
    ? ""
    : '<div class="empty">Belum ada tugas selesai.</div>';
    done.sort((a, b) => b.date.localeCompare(a.date));
    done.forEach((item) => {
    const row = document.createElement("div");
    row.className = "item";
    row.style.background = "var(--done-bg)";
    row.innerHTML = `
        <div class="check done" data-id="${item.id}"></div>
        <div class="item-body">
        <div class="task-text struck">${escapeHtml(item.text)}</div>
        <div class="meta">
        <span class="badge ${item.level}">${levelLabel(item.level)}</span>
        <span class="date-tag">${formatShort(item.date)}</span>
        </div>
        </div>
        <button class="del" data-del="${item.id}" aria-label="Hapus">✕</button>
    `;
    doneListEl.appendChild(row);
    });

    document.querySelectorAll(".check").forEach((c) => {
    c.addEventListener("click", () => {
        const it = items.find((i) => i.id === c.dataset.id);
        if (it) {
        it.done = !it.done;
        save();
        render();
        }
    });
    });
    document.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", () => {
        items = items.filter((i) => i.id !== b.dataset.del);
        save();
        render();
    });
    });
}

document.getElementById("deleteAllBtn").addEventListener("click", () => {
    if (items.length === 0) return;
    if (confirm("Hapus seluruh to do list?")) {
    items = [];
    save();
    render();
    }
});

render();
